from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any
import uuid

from fastapi import APIRouter
from sqlalchemy.orm import Session

from ..core.db import SessionLocal
from ..models.gl_entry import GLEntry
from ..models.bank_txn import BankTxn
from ..models.reconcile_match import ReconcileMatch
from ..models.flux_expl import FluxExpl
from ..models.forecast_snapshot import ForecastSnapshot
from ..models.exception_case import ExceptionCase
from ..models.job_run import JobRun
from services.receipts.sdk import create_receipt


router = APIRouter(prefix="/agents", tags=["agents"])


def _session() -> Session:
    return SessionLocal()


@router.post("/auto_reconciler/run")
def auto_reconciler_run(window_days: int = 1) -> dict[str, Any]:
    sess = _session()
    try:
        matches = []
        for g in sess.query(GLEntry).all():
            start = g.date - timedelta(days=window_days)
            end = g.date + timedelta(days=window_days)
            candidates = (
                sess.query(BankTxn)
                .filter(BankTxn.account_ref == g.account)
                .filter(BankTxn.amount == g.amount)
                .filter(BankTxn.date >= start)
                .filter(BankTxn.date <= end)
                .all()
            )
            if candidates:
                b = candidates[0]
                m = ReconcileMatch(
                    id=str(uuid.uuid4()),
                    gl_entry_id=g.id,
                    bank_txn_id=b.id,
                    confidence=1.0,
                    status="matched",
                    receipt_id=None,
                )
                payload = {
                    "agent": "auto_reconciler",
                    "inputs": {"gl_entry_id": g.id, "bank_txn_id": b.id},
                    "outputs": {"status": "matched", "confidence": 1.0},
                }
                header = create_receipt(payload, kind="reconcile_match", links={"gl_entry_id": g.id, "bank_txn_id": b.id})
                m.receipt_id = header["id"]
                sess.add(m)
                matches.append({"gl_entry_id": g.id, "bank_txn_id": b.id, "receipt_id": m.receipt_id})
        sess.commit()
        outputs = {"matched": len(matches), "matches": matches}
        jr = JobRun(id=str(uuid.uuid4()), agent="auto_reconciler", inputs={"window_days": window_days}, outputs=outputs, status="completed", receipt_id=matches[0]["receipt_id"] if matches else None)
        sess.add(jr)
        sess.commit()
        return outputs
    finally:
        sess.close()


@router.post("/flux/run")
def flux_run(entity_id: str = "E1", account: str = "AR", period: str = "2025-08") -> dict[str, Any]:
    sess = _session()
    try:
        # Very simple drivers based on GL movement
        drivers = {"volume": 0.6, "price": 0.3, "fx": 0.1}
        narrative = f"Variance driven by volume and price in {period}"
        payload = {"agent": "flux", "entity_id": entity_id, "account": account, "period": period, "drivers": drivers, "narrative": narrative}
        header = create_receipt(payload, kind="flux_expl", links={"entity_id": entity_id, "account": account})
        fx = FluxExpl(id=str(uuid.uuid4()), entity_id=entity_id, account=account, period=period, drivers=drivers, narrative=narrative, receipt_id=header["id"])
        sess.add(fx)
        outputs = {"id": fx.id, "receipt_id": fx.receipt_id}
        jr = JobRun(id=str(uuid.uuid4()), agent="flux", inputs={"entity_id": entity_id, "account": account, "period": period}, outputs=outputs, status="completed", receipt_id=fx.receipt_id)
        sess.add(jr)
        sess.commit()
        return outputs
    finally:
        sess.close()


@router.post("/forecast/run")
def forecast_run(period: str = "2025-09") -> dict[str, Any]:
    sess = _session()
    try:
        params = {"ar_curve_days": [0.5, 0.3, 0.2], "ap_curve_days": [0.6, 0.3, 0.1]}
        outputs = {"cash_buffer_days": 45}
        payload = {"agent": "forecast", "period": period, "params": params, "outputs": outputs}
        header = create_receipt(payload, kind="forecast_snapshot", links={})
        fs = ForecastSnapshot(id=str(uuid.uuid4()), period=period, params=params, outputs=outputs, receipt_id=header["id"])
        sess.add(fs)
        outputs = {"id": fs.id, "receipt_id": fs.receipt_id}
        jr = JobRun(id=str(uuid.uuid4()), agent="forecast", inputs={"period": period}, outputs=outputs, status="completed", receipt_id=fs.receipt_id)
        sess.add(jr)
        sess.commit()
        return outputs
    finally:
        sess.close()


@router.post("/exception_triage/run")
def exception_triage_run(entity_id: str = "E1") -> dict[str, Any]:
    sess = _session()
    try:
        matched_gl_ids = {m.gl_entry_id for m in sess.query(ReconcileMatch).all()}
        exceptions = []
        for g in sess.query(GLEntry).filter(GLEntry.entity_id == entity_id).all():
            if g.id not in matched_gl_ids:
                case = {
                    "entity_id": entity_id,
                    "type": "recon_break",
                    "root_cause_ranked": [
                        {"cause": "timing", "score": 0.6},
                        {"cause": "amount_diff", "score": 0.3}
                    ],
                    "proposed_fix": None,
                    "status": "open",
                    "assignee": None,
                }
                header = create_receipt(
                    payload={"agent": "exception_triage", "gl_entry_id": g.id, **case},
                    kind="exception_case",
                    links={"gl_entry_id": g.id}
                )
                ec = ExceptionCase(
                    id=str(uuid.uuid4()),
                    receipt_id=header["id"],
                    **case,
                )
                sess.add(ec)
                exceptions.append({"id": ec.id, "receipt_id": ec.receipt_id, "type": ec.type})
        outputs = {"created": len(exceptions), "cases": exceptions}
        jr = JobRun(id=str(uuid.uuid4()), agent="exception_triage", inputs={"entity_id": entity_id}, outputs=outputs, status="completed", receipt_id=exceptions[0]["receipt_id"] if exceptions else None)
        sess.add(jr)
        sess.commit()
        return outputs
    finally:
        sess.close()


@router.post("/treasury/run")
def treasury_run() -> dict[str, Any]:
    # Stub treasury calculation
    payload = {"agent": "treasury", "outputs": {"projected_buffer_days": 42, "covenant_risk_flags": [{"name": "Leverage", "status": "watch"}]}}
    header = create_receipt(payload, kind="treasury_kpi", links={})
    outputs = {"receipt_id": header["id"], "outputs": payload["outputs"]}
    sess = _session()
    try:
        sess.add(JobRun(id=str(uuid.uuid4()), agent="treasury", inputs={}, outputs=outputs, status="completed", receipt_id=header["id"]))
        sess.commit()
    finally:
        sess.close()
    return outputs


def _dq_logic(sess: Session) -> dict[str, Any]:
    latest_gl = sess.query(GLEntry).order_by(GLEntry.date.desc()).first()
    latest_bank = sess.query(BankTxn).order_by(BankTxn.date.desc()).first()
    from datetime import date as _date
    today = _date.today()
    freshness = {
        "gl_days_since": (today - latest_gl.date).days if latest_gl else None,
        "bank_days_since": (today - latest_bank.date).days if latest_bank else None,
    }
    payload = {"agent": "dq_sentinel", "outputs": freshness}
    header = create_receipt(payload, kind="dq_kpi", links={})
    outputs = {"receipt_id": header["id"], **freshness}
    sess.add(JobRun(id=str(uuid.uuid4()), agent="dq_sentinel", inputs={}, outputs=outputs, status="completed", receipt_id=header["id"]))
    return outputs


@router.post("/dq/run")
def dq_run() -> dict[str, Any]:
    sess = _session()
    try:
        outputs = _dq_logic(sess)
        sess.commit()
        return outputs
    finally:
        sess.close()


@router.post("/dq_sentinel/run")
def dq_sentinel_run() -> dict[str, Any]:
    sess = _session()
    try:
        outputs = _dq_logic(sess)
        sess.commit()
        return outputs
    finally:
        sess.close()



