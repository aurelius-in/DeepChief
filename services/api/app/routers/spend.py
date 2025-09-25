from __future__ import annotations

from typing import Any
import uuid
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.spend_issue import SpendIssue
from services.receipts.sdk import create_receipt


router = APIRouter(prefix="/spend", tags=["spend"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_spend(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(SpendIssue).offset(offset).limit(limit).all()
        return [
            {
                "id": r.id,
                "type": r.type,
                "vendor": r.vendor,
                "amount": float(r.amount) if r.amount is not None else None,
                "status": r.status,
                "metadata": r.metadata,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


@router.get("/spend.csv", response_class=PlainTextResponse)
def export_spend_csv(limit: int = 1000, offset: int = 0) -> str:
    sess = _session()
    try:
        rows = sess.query(SpendIssue).offset(offset).limit(limit).all()
        lines = ["id,type,vendor,amount,receipt_id"]
        for r in rows:
            amt = (f"{float(r.amount):.2f}" if r.amount is not None else "")
            lines.append(f"{r.id},{r.type},{r.vendor or ''},{amt},{r.receipt_id or ''}")
        return "\n".join(lines) + "\n"
    finally:
        sess.close()


@router.post("/duplicate/run")
def run_duplicate_sentinel() -> dict[str, Any]:
    sess = _session()
    try:
        payload = {"agent": "spend_duplicate", "detected": [{"vendor": "Acme", "amount": 123.45}]}
        header = create_receipt(payload, kind="spend_issue", links={})
        issue = SpendIssue(id=str(uuid.uuid4()), type="duplicate_payment", vendor="Acme", amount=123.45, status="open", metadata=payload, receipt_id=header["id"])
        sess.add(issue)
        sess.commit()
        return {"created": 1, "receipt_id": issue.receipt_id}
    finally:
        sess.close()


@router.post("/saas/run")
def run_saas_optimizer() -> dict[str, Any]:
    sess = _session()
    try:
        payload = {"agent": "saas_optimizer", "waste": [{"app": "Zoom", "seats_unused": 5}]}
        header = create_receipt(payload, kind="spend_issue", links={})
        issue = SpendIssue(id=str(uuid.uuid4()), type="saas_waste", vendor="Zoom", amount=None, status="open", metadata=payload, receipt_id=header["id"])
        sess.add(issue)
        sess.commit()
        return {"created": 1, "receipt_id": issue.receipt_id}
    finally:
        sess.close()


