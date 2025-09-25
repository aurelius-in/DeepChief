from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.job_run import JobRun


router = APIRouter(prefix="/job_runs", tags=["job_runs"])


def _session() -> Session:
    return SessionLocal()


@router.get("")
def list_job_runs(limit: int = 20, offset: int = 0) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(JobRun).offset(offset).limit(limit).all()
        return [
            {
                "id": r.id,
                "agent": r.agent,
                "status": r.status,
                "inputs": r.inputs,
                "outputs": r.outputs,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


