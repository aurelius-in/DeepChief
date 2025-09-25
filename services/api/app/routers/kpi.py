from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.gl_entry import GLEntry
from ..models.bank_txn import BankTxn
from ..models.reconcile_match import ReconcileMatch
from ..models.spend_issue import SpendIssue
from ..models.exception_case import ExceptionCase
from ..models.control_run import ControlRun
from ..models.evidence_receipt import EvidenceReceipt


router = APIRouter(prefix="/kpi", tags=["kpi"])


def _session() -> Session:
    return SessionLocal()


@router.get("/close_to_cash")
def kpi_close_to_cash() -> dict[str, Any]:
    sess = _session()
    try:
        total_gl = sess.query(func.count(GLEntry.id)).scalar() or 0
        total_bank = sess.query(func.count(BankTxn.id)).scalar() or 0
        total_matched = sess.query(func.count(ReconcileMatch.id)).scalar() or 0
        exceptions_open = sess.query(func.count(ExceptionCase.id)).filter(ExceptionCase.status == 'open').scalar() or 0
        # controls pass rate: percentage of control runs without findings
        total_runs = sess.query(func.count(ControlRun.id)).scalar() or 0
        passing_runs = 0
        for r in sess.query(ControlRun).all():
            items = (r.findings or {}).get('items') or []
            if len(items) == 0:
                passing_runs += 1
        auto_match_rate = (total_matched / max(total_gl, 1)) * 100.0
        return {
            "auto_match_rate": round(auto_match_rate, 2),
            "gl_count": total_gl,
            "bank_count": total_bank,
            "matched_count": total_matched,
            "exceptions_open": exceptions_open,
            "controls_pass_rate": (passing_runs / max(total_runs, 1)) * 100.0 if total_runs else 0.0,
        }
    finally:
        sess.close()


@router.get("/spend")
def kpi_spend() -> dict[str, Any]:
    sess = _session()
    try:
        total = sess.query(func.count(SpendIssue.id)).scalar() or 0
        duplicates = sess.query(func.count(SpendIssue.id)).filter(SpendIssue.type == 'duplicate_payment').scalar() or 0
        saas = sess.query(func.count(SpendIssue.id)).filter(SpendIssue.type == 'saas_waste').scalar() or 0
        return {"issues_total": total, "duplicates": duplicates, "saas": saas}
    finally:
        sess.close()


@router.get("/treasury")
def kpi_treasury() -> dict[str, Any]:
    # Stubbed KPI: use forecast snapshot outputs if present later
    return {
        "projected_buffer_days": 42,
        "covenant_risk_flags": [
            {"name": "DSCR", "status": "ok"},
            {"name": "Leverage", "status": "watch"},
        ],
    }


@router.get("/audit")
def kpi_audit() -> dict[str, Any]:
    sess = _session()
    try:
        receipts_total = sess.query(func.count(EvidenceReceipt.id)).scalar() or 0
        return {
            "receipts_total": receipts_total,
            "receipts_by_type": {},
            "pbc_served": 0,
        }
    finally:
        sess.close()


