from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.flux_expl import FluxExpl


router = APIRouter(prefix="/flux", tags=["flux"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_flux(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(FluxExpl).offset(offset).limit(limit).all()
        return [
            {
                "id": r.id,
                "entity_id": r.entity_id,
                "account": r.account,
                "period": r.period,
                "drivers": r.drivers,
                "narrative": r.narrative,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


@router.get("/flux.csv", response_class=PlainTextResponse)
def export_flux_csv(limit: int = 1000, offset: int = 0) -> str:
    sess = _session()
    try:
        rows = sess.query(FluxExpl).offset(offset).limit(limit).all()
        lines = ["id,entity_id,account,period,receipt_id"]
        for r in rows:
            lines.append(f"{r.id},{r.entity_id},{r.account},{r.period},{r.receipt_id or ''}")
        return "\n".join(lines) + "\n"
    finally:
        sess.close()


