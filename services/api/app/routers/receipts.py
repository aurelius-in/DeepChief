from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

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


