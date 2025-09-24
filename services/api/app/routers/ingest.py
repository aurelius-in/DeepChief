from __future__ import annotations

from datetime import datetime
from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.entity import Entity
from ..models.gl_entry import GLEntry
from ..models.bank_txn import BankTxn
from ..core.config import settings
from services.connectors.erp import NetsuiteMock, ERPClient
from services.connectors.bank import BankMock, BankClient


router = APIRouter(prefix="", tags=["ingest"])


def _session() -> Session:
    return SessionLocal()


@router.post("/ingest/mock")
def ingest_mock() -> dict[str, Any]:
    erp: ERPClient = NetsuiteMock()
    bank: BankClient = BankMock()

    sess = _session()
    try:
        if not sess.get(Entity, "E1"):
            sess.add(Entity(id="E1", name="Pilot Entity", coa_map=None, created_at=datetime.utcnow()))
        gl_entries = list(erp.iter_gl_entries())
        for g in gl_entries:
            if not sess.get(GLEntry, g["id"]):
                sess.add(GLEntry(**g))
        bank_txns = list(bank.iter_bank_txns())
        for b in bank_txns:
            if not sess.get(BankTxn, b["id"]):
                sess.add(BankTxn(**b))
        sess.commit()
        return {"gl_entries": len(gl_entries), "bank_txns": len(bank_txns)}
    finally:
        sess.close()


@router.get("/gl_entries")
def list_gl_entries(limit: int = 100) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(GLEntry).limit(limit).all()
        return [
            {
                "id": r.id,
                "entity_id": r.entity_id,
                "account": r.account,
                "amount": float(r.amount),
                "date": r.date.isoformat(),
                "source_ref": r.source_ref,
            }
            for r in rows
        ]
    finally:
        sess.close()


@router.get("/bank_txns")
def list_bank_txns(limit: int = 100) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(BankTxn).limit(limit).all()
        return [
            {
                "id": r.id,
                "account_ref": r.account_ref,
                "amount": float(r.amount),
                "date": r.date.isoformat(),
                "metadata": r.metadata,
            }
            for r in rows
        ]
    finally:
        sess.close()


