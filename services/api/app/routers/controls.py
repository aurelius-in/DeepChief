from __future__ import annotations

from datetime import date, timedelta, datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.gl_entry import GLEntry
from ..models.control_run import ControlRun
from services.receipts.sdk import create_receipt
from ..models.bank_txn import BankTxn


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


def evaluate_vendor_bank_change(sess: Session) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    rows = sess.query(BankTxn).all()
    for r in rows:
        if isinstance(r.metadata, dict) and r.metadata.get("bank_change") is True:
            findings.append({
                "bank_txn_id": r.id,
                "flag": "bank_change_review",
            })
    return findings


def evaluate_je_materiality(sess: Session, materiality: float = 100000.0) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    rows = sess.query(GLEntry).all()
    for r in rows:
        amt = float(r.amount)
        if abs(amt) >= materiality:
            findings.append({
                "je_id": r.id,
                "amount_abs": abs(amt),
                "flag": "materiality_review",
            })
    return findings


@router.post("/run")
def run_controls(window_days: int = 30, mode: str = "read_only") -> dict[str, Any]:
    sess = _session()
    try:
        end = date.today()
        start = end - timedelta(days=window_days)
        all_results: list[dict[str, Any]] = []

        def run_one(key: str, eval_findings: list[dict[str, Any]]):
            if mode.lower() == "propose":
                # don't persist; return proposed changes only
                header = create_receipt(
                    payload={"control": key, "findings": eval_findings},
                    kind="control_run_proposed",
                    links={}
                )
                all_results.append({"control_key": key, "findings": eval_findings, "proposed": True, "receipt_id": header["id"]})
                return
            header = create_receipt(
                payload={"control": key, "findings": eval_findings},
                kind="control_run",
                links={}
            )
            cr = ControlRun(
                id=str(uuid.uuid4()),
                control_key=key,
                window_start=start,
                window_end=end,
                status="completed",
                findings={"items": eval_findings},
                receipt_id=header["id"],
            )
            sess.add(cr)
            all_results.append({"control_key": key, "findings": eval_findings, "receipt_id": cr.receipt_id})

        run_one("CTRL_ApprovalThreshold", evaluate_approval_threshold(sess))
        run_one("CTRL_VendorBankChange", evaluate_vendor_bank_change(sess))
        run_one("CTRL_JEMateriality", evaluate_je_materiality(sess))

        if mode.lower() != "propose":
            sess.commit()
        return {"runs": all_results}
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


@router.get("/latest.csv", response_class=PlainTextResponse)
def export_latest_controls_csv(limit: int = 100) -> str:
    sess = _session()
    try:
        rows = sess.query(ControlRun).order_by(ControlRun.window_end.desc()).limit(limit).all()
        lines = ["control_key,window_start,window_end,findings_count,receipt_id"]
        for r in rows:
            count = len((r.findings or {}).get('items') or [])
            lines.append(f"{r.control_key},{r.window_start.isoformat()},{r.window_end.isoformat()},{count},{r.receipt_id}")
        return "\n".join(lines) + "\n"
    finally:
        sess.close()


