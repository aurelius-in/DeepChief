from __future__ import annotations

from typing import Any, Iterable
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from services.connectors.apps_billing import BillingMock, BillingClient
from services.connectors.apps_hris import HRISMock, HRISClient


router = APIRouter(prefix="/apps", tags=["apps"])


def _paginate(seq: Iterable[dict[str, Any]], limit: int, offset: int) -> list[dict[str, Any]]:
    arr = list(seq)
    return arr[offset : offset + limit]


@router.get("/billing/invoices")
def list_billing_invoices(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
    client: BillingClient = BillingMock()
    return _paginate(client.iter_invoices(), limit, offset)


@router.get("/hris/employees")
def list_hris_employees(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
    client: HRISClient = HRISMock()
    return _paginate(client.iter_employees(), limit, offset)


@router.get("/billing/invoices.csv", response_class=PlainTextResponse)
def export_billing_invoices_csv(limit: int = 1000, offset: int = 0) -> str:
    client: BillingClient = BillingMock()
    rows = _paginate(client.iter_invoices(), limit, offset)
    lines = ["invoice_id,vendor,amount,status"]
    for r in rows:
        amt = r.get("amount")
        amt_str = (f"{float(amt):.2f}" if amt is not None else "")
        lines.append(f"{r.get('invoice_id','')},{r.get('vendor','')},{amt_str},{r.get('status','')}")
    return "\n".join(lines) + "\n"


@router.get("/hris/employees.csv", response_class=PlainTextResponse)
def export_hris_employees_csv(limit: int = 1000, offset: int = 0) -> str:
    client: HRISClient = HRISMock()
    rows = _paginate(client.iter_employees(), limit, offset)
    lines = ["employee_id,name,department"]
    for r in rows:
        lines.append(f"{r.get('employee_id','')},{r.get('name','')},{r.get('department','')}")
    return "\n".join(lines) + "\n"


