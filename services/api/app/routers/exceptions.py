from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi.responses import PlainTextResponse

from ..core.db import SessionLocal
from ..models.exception_case import ExceptionCase


router = APIRouter(prefix="/exceptions", tags=["exceptions"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_exceptions(limit: int = 100, offset: int = 0, status: str | None = None) -> list[dict[str, Any]]:
    sess = _session()
    try:
        q = sess.query(ExceptionCase)
        if status:
            q = q.filter(ExceptionCase.status == status)
        rows = q.offset(offset).limit(limit).all()
        return [
            {
                "id": r.id,
                "entity_id": r.entity_id,
                "type": r.type,
                "root_cause_ranked": r.root_cause_ranked,
                "status": r.status,
                "assignee": r.assignee,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


@router.get("/exceptions.csv", response_class=PlainTextResponse)
def export_exceptions_csv(limit: int = 1000, offset: int = 0, status: str | None = None) -> str:
    sess = _session()
    try:
        q = sess.query(ExceptionCase)
        if status:
            q = q.filter(ExceptionCase.status == status)
        rows = q.offset(offset).limit(limit).all()
        lines = ["id,entity_id,type,status,assignee,receipt_id"]
        for r in rows:
            lines.append(f"{r.id},{r.entity_id},{r.type},{r.status},{(r.assignee or '').replace(',', ' ')},{r.receipt_id or ''}")
        return "\n".join(lines) + "\n"
    finally:
        sess.close()


