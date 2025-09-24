from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.reconcile_match import ReconcileMatch


router = APIRouter(prefix="", tags=["matches"])


def _session() -> Session:
    return SessionLocal()


@router.get("/matches")
def list_matches(limit: int = 100) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(ReconcileMatch).limit(limit).all()
        return [
            {
                "id": r.id,
                "gl_entry_id": r.gl_entry_id,
                "bank_txn_id": r.bank_txn_id,
                "confidence": r.confidence,
                "status": r.status,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


