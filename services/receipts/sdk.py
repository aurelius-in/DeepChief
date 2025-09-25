import base64
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from minio import Minio
from nacl import signing
from nacl import exceptions as nacl_exceptions
from nacl.encoding import RawEncoder

from services.api.app.core.config import settings
from services.api.app.core.db import SessionLocal
from services.api.app.models.evidence_receipt import EvidenceReceipt


def canonical_json(obj: Any) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_base64(data: bytes) -> str:
    return base64.b64encode(hashlib.sha256(data).digest()).decode("ascii")


def sign_payload(payload: Dict[str, Any], private_key_b64: Optional[str] = None) -> Dict[str, str]:
    payload_bytes = canonical_json(payload)
    payload_hash_b64 = sha256_base64(payload_bytes)

    private_key_b64 = private_key_b64 or settings_dict().get("RECEIPT_SIGNING_PRIVATE_KEY")
    if not private_key_b64:
        raise RuntimeError("RECEIPT_SIGNING_PRIVATE_KEY not configured")
    sk = signing.SigningKey(base64.b64decode(private_key_b64))
    signed = sk.sign(base64.b64decode(payload_hash_b64), encoder=RawEncoder)
    signature_b64 = base64.b64encode(signed.signature).decode("ascii")
    public_key_b64 = base64.b64encode(sk.verify_key.encode()).decode("ascii")
    return {
        "payload_hash_b64": payload_hash_b64,
        "signature_b64": signature_b64,
        "public_key_b64": public_key_b64,
    }


def verify_signature(payload_hash_b64: str, signature_b64: str, public_key_b64: str) -> bool:
    try:
        vk = signing.VerifyKey(base64.b64decode(public_key_b64))
        vk.verify(base64.b64decode(payload_hash_b64), base64.b64decode(signature_b64), encoder=RawEncoder)
        return True
    except (ValueError, nacl_exceptions.BadSignatureError):
        return False


def settings_dict() -> Dict[str, str]:
    # Bridge for places outside FastAPI DI
    return {
        "MINIO_ENDPOINT": settings.minio_endpoint,
        "MINIO_ACCESS_KEY": settings.minio_access_key,
        "MINIO_SECRET_KEY": settings.minio_secret_key,
        "MINIO_BUCKET": settings.minio_bucket,
        "RECEIPT_SIGNING_PRIVATE_KEY": getattr(settings, "receipt_signing_private_key", None) or '',
    }


def _minio_client() -> Minio:
    endpoint = settings.minio_endpoint.replace("http://", "").replace("https://", "")
    secure = settings.minio_endpoint.startswith("https://")
    return Minio(
        endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=secure,
    )


def _ensure_bucket(client: Minio, bucket: str) -> None:
    found = client.bucket_exists(bucket)
    if not found:
        client.make_bucket(bucket)


def _minio_put_object(object_name: str, data: bytes, content_type: str = "application/json") -> str:
    client = _minio_client()
    bucket = settings.minio_bucket
    _ensure_bucket(client, bucket)
    client.put_object(
        bucket,
        object_name,
        data=bytes_to_stream(data),
        length=len(data),
        content_type=content_type,
    )
    # Public URL for local dev (MinIO path-style)
    return f"{settings.minio_endpoint.rstrip('/')}/{bucket}/{object_name}"


def bytes_to_stream(data: bytes):
    from io import BytesIO
    return BytesIO(data)


SENSITIVE_KEYS = {"ssn", "tax_id", "email", "phone", "account_number", "iban"}


def _redact(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: ("[redacted]" if k in SENSITIVE_KEYS else _redact(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_redact(v) for v in obj]
    return obj


def create_receipt(payload: Dict[str, Any], kind: str, links: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    receipt_id = str(uuid.uuid4())
    signature = sign_payload(payload)

    safe_payload = _redact(payload)
    object_name = f"receipts/{receipt_id}.json"
    payload_url = _minio_put_object(object_name, canonical_json(safe_payload))

    header = {
        "id": receipt_id,
        "kind": kind,
        "sha256_b64": signature["payload_hash_b64"],
        "signed_hash_b64": signature["signature_b64"],
        "public_key_b64": signature["public_key_b64"],
        "payload_url": payload_url,
        "links": links,
        "created_at": now,
    }
    # In MVP, return header. Persisting header to DB added in later step.
    _persist_header_stub(receipt_id, header)
    _persist_header_db(header)
    return header


_HEADER_KV: Dict[str, Dict[str, Any]] = {}


def _persist_header_stub(receipt_id: str, header: Dict[str, Any]) -> None:
    _HEADER_KV[receipt_id] = header


def get_receipt_header(receipt_id: str) -> Optional[Dict[str, Any]]:
    return _HEADER_KV.get(receipt_id)


def _persist_header_db(header: Dict[str, Any]) -> None:
    sess = SessionLocal()
    try:
        if not sess.get(EvidenceReceipt, header["id"]):
            sess.add(EvidenceReceipt(
                id=header["id"],
                sha256_b64=header["sha256_b64"],
                signed_hash_b64=header["signed_hash_b64"],
                public_key_b64=header["public_key_b64"],
                payload_url=header["payload_url"],
                created_at=datetime.fromisoformat(header["created_at"].replace('Z', '+00:00')),
            ))
            sess.commit()
    finally:
        sess.close()


