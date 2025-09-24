from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.exception_case import ExceptionCase


router = APIRouter(prefix="/exceptions", tags=["exceptions"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_exceptions(limit: int = 100) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(ExceptionCase).limit(limit).all()
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


