from __future__ import annotations

from datetime import date, timedelta, datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.gl_entry import GLEntry
from ..models.control_run import ControlRun
from services.receipts.sdk import create_receipt


router = APIRouter(prefix="/controls", tags=["controls"])


def _session() -> Session:
    return SessionLocal()


def evaluate_approval_threshold(sess: Session, amount_threshold: float = 25000.0) -> list[dict[str, Any]]:
    findings = []
    # Interpret AR positive amounts as JEs for simplicity in MVP
    rows = sess.query(GLEntry).filter(GLEntry.account == 'AR').all()
    for r in rows:
        amt = float(r.amount)
        if abs(amt) >= amount_threshold:
            findings.append({
                "je_id": r.id,
                "amount_abs": abs(amt),
                "flag": "approval_required",
                "notify": "controller",
            })
    return findings


@router.post("/run")
def run_controls(window_days: int = 30) -> dict[str, Any]:
    sess = _session()
    try:
        end = date.today()
        start = end - timedelta(days=window_days)
        findings = evaluate_approval_threshold(sess)
        header = create_receipt(
            payload={"control": "CTRL_ApprovalThreshold", "findings": findings},
            kind="control_run",
            links={}
        )
        cr = ControlRun(
            id=str(uuid.uuid4()),
            control_key="CTRL_ApprovalThreshold",
            window_start=start,
            window_end=end,
            status="completed",
            findings={"items": findings},
            receipt_id=header["id"],
        )
        sess.add(cr)
        sess.commit()
        return {"control_key": cr.control_key, "findings": findings, "receipt_id": cr.receipt_id}
    finally:
        sess.close()


@router.get("/latest")
def latest_control_runs(limit: int = 5) -> list[dict[str, Any]]:
    sess = _session()
    try:
        rows = sess.query(ControlRun).order_by(ControlRun.window_end.desc()).limit(limit).all()
        return [
            {
                "control_key": r.control_key,
                "window_start": r.window_start.isoformat(),
                "window_end": r.window_end.isoformat(),
                "status": r.status,
                "findings": r.findings,
                "receipt_id": r.receipt_id,
            }
            for r in rows
        ]
    finally:
        sess.close()


