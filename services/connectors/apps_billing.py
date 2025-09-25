from __future__ import annotations

from typing import Iterable, Dict
from pathlib import Path
import json


class BillingClient:
    def iter_invoices(self) -> Iterable[Dict]:
        raise NotImplementedError


class BillingMock(BillingClient):
    def iter_invoices(self) -> Iterable[Dict]:
        samples = Path('data/samples/billing_invoices.json')
        if samples.exists():
            data = json.loads(samples.read_text())
            for row in data:
                yield row
        else:
            yield {"invoice_id": "INV-1001", "vendor": "Acme", "amount": 123.45, "status": "open"}


