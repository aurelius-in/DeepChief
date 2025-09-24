from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any
import uuid

from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.gl_entry import GLEntry
from ..models.bank_txn import BankTxn
from ..models.reconcile_match import ReconcileMatch
from services.receipts.sdk import create_receipt


router = APIRouter(prefix="/agents", tags=["agents"])


def _session() -> Session:
    return SessionLocal()


@router.post("/auto_reconciler/run")
def auto_reconciler_run(window_days: int = 1) -> dict[str, Any]:
    sess = _session()
    try:
        matches = []
        for g in sess.query(GLEntry).all():
            start = g.date - timedelta(days=window_days)
            end = g.date + timedelta(days=window_days)
            candidates = (
                sess.query(BankTxn)
                .filter(BankTxn.account_ref == g.account)
                .filter(BankTxn.amount == g.amount)
                .filter(BankTxn.date >= start)
                .filter(BankTxn.date <= end)
                .all()
            )
            if candidates:
                b = candidates[0]
                m = ReconcileMatch(
                    id=str(uuid.uuid4()),
                    gl_entry_id=g.id,
                    bank_txn_id=b.id,
                    confidence=1.0,
                    status="matched",
                    receipt_id=None,
                )
                payload = {
                    "agent": "auto_reconciler",
                    "inputs": {"gl_entry_id": g.id, "bank_txn_id": b.id},
                    "outputs": {"status": "matched", "confidence": 1.0},
                }
                header = create_receipt(payload, kind="reconcile_match", links={"gl_entry_id": g.id, "bank_txn_id": b.id})
                m.receipt_id = header["id"]
                sess.add(m)
                matches.append({"gl_entry_id": g.id, "bank_txn_id": b.id, "receipt_id": m.receipt_id})
        sess.commit()
        return {"matched": len(matches), "matches": matches}
    finally:
        sess.close()


