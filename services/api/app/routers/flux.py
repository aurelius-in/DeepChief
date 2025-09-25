from __future__ import annotations

from typing import Any
from fastapi import APIRouter
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


