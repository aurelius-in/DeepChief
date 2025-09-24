from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import json
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.entity import Entity
from ..models.gl_entry import GLEntry
from ..models.bank_txn import BankTxn


router = APIRouter(prefix="", tags=["ingest"])


def _session() -> Session:
    return SessionLocal()


@router.post("/ingest/mock")
def ingest_mock() -> dict[str, Any]:
    samples_dir = Path("data/samples")
    with (samples_dir / "gl_entry.json").open() as f:
        gl_entries = json.load(f)
    with (samples_dir / "bank_txn.json").open() as f:
        bank_txns = json.load(f)

    sess = _session()
    try:
        if not sess.get(Entity, "E1"):
            sess.add(Entity(id="E1", name="Pilot Entity", coa_map=None, created_at=datetime.utcnow()))
        for g in gl_entries:
            if not sess.get(GLEntry, g["id"]):
                sess.add(GLEntry(**g))
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


