from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.forecast_snapshot import ForecastSnapshot


router = APIRouter(prefix="/forecast", tags=["forecast"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_forecast(limit: int = 100) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(ForecastSnapshot).limit(limit).all()
        return [
            {
                "id": r.id,
                "period": r.period,
                "params": r.params,
                "outputs": r.outputs,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


