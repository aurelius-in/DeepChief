from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.policy_version import PolicyVersion


router = APIRouter(prefix="/policies", tags=["policies"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_policies(limit: int = 200) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(PolicyVersion).limit(limit).all()
        return [
            {
                "id": r.id,
                "key": r.key,
                "yaml": r.yaml,
                "checksum": r.checksum,
                "active": r.active,
            }
            for r in rows
        ]
    finally:
        sess.close()


