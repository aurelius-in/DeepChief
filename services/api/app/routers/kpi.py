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
        auto_match_rate = (total_matched / max(total_gl, 1)) * 100.0
        return {
            "auto_match_rate": round(auto_match_rate, 2),
            "gl_count": total_gl,
            "bank_count": total_bank,
            "matched_count": total_matched,
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


