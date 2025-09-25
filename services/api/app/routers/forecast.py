from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.forecast_snapshot import ForecastSnapshot


router = APIRouter(prefix="/forecast", tags=["forecast"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_forecast(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(ForecastSnapshot).offset(offset).limit(limit).all()
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


@router.get("/forecast.csv", response_class=PlainTextResponse)
def export_forecast_csv(limit: int = 1000, offset: int = 0) -> str:
    sess = _session()
    try:
        rows = sess.query(ForecastSnapshot).offset(offset).limit(limit).all()
        lines = ["id,period,receipt_id"]
        for r in rows:
            lines.append(f"{r.id},{r.period},{r.receipt_id or ''}")
        return "\n".join(lines) + "\n"
    finally:
        sess.close()


