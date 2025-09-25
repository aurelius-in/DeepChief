from __future__ import annotations

from typing import Any, List, Dict
from fastapi import APIRouter


router = APIRouter(prefix="/treasury", tags=["treasury"])


@router.get("/cash")
def cash_view(days: int = 14) -> Dict[str, Any]:
    # Stub daily balances and projected cash-in/out
    from datetime import date, timedelta
    today = date.today()
    series: List[Dict[str, Any]] = []
    bal = 250000.0
    for i in range(days):
        d = today + timedelta(days=i)
        inflow = 20000.0 if i % 3 == 0 else 5000.0
        outflow = 15000.0 if i % 5 == 0 else 7000.0
        bal = bal + inflow - outflow
        series.append({
            "date": d.isoformat(),
            "inflow": round(inflow, 2),
            "outflow": round(outflow, 2),
            "balance": round(bal, 2),
        })
    return {"series": series}


