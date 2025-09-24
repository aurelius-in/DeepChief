from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from typing import List
from io import BytesIO
import zipfile
import requests

from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session

from services.api.app.core.db import SessionLocal
from services.api.app.models.evidence_receipt import EvidenceReceipt

from services.receipts.sdk import verify_signature, get_receipt_header


class VerifyRequest(BaseModel):
    payload_hash_b64: str
    signature_b64: str
    public_key_b64: str


router = APIRouter()


@router.post("/verify")
def verify(req: VerifyRequest) -> Dict[str, Any]:
    ok = verify_signature(
        payload_hash_b64=req.payload_hash_b64,
        signature_b64=req.signature_b64,
        public_key_b64=req.public_key_b64,
    )
    if not ok:
        raise HTTPException(status_code=400, detail="invalid-signature")
    return {"valid": True}


@router.get("/{receipt_id}")
def get_receipt(receipt_id: str) -> Dict[str, Any]:
    header = get_receipt_header(receipt_id)
    if header is None:
        raise HTTPException(status_code=404, detail="not-found")
    return header


def _session() -> Session:
    return SessionLocal()


@router.get("/pack")
def pack(ids: str) -> StreamingResponse:
    id_list: List[str] = [x for x in ids.split(',') if x]
    mem = BytesIO()
    with zipfile.ZipFile(mem, mode='w', compression=zipfile.ZIP_DEFLATED) as zf:
        sess = _session()
        try:
            for rid in id_list:
                rec = sess.get(EvidenceReceipt, rid)
                if not rec:
                    continue
                try:
                    resp = requests.get(rec.payload_url, timeout=10)
                    resp.raise_for_status()
                    zf.writestr(f"receipts/{rid}.json", resp.content)
                except requests.RequestException:
                    continue
        finally:
            sess.close()
    mem.seek(0)
    return StreamingResponse(mem, media_type='application/zip', headers={'Content-Disposition': 'attachment; filename="receipts_pack.zip"'})


