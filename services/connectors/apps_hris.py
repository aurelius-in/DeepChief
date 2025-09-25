from __future__ import annotations

from typing import Iterable, Dict
from pathlib import Path
import json


class HRISClient:
    def iter_employees(self) -> Iterable[Dict]:
        raise NotImplementedError


class HRISMock(HRISClient):
    def iter_employees(self) -> Iterable[Dict]:
        samples = Path('data/samples/hris_employees.json')
        if samples.exists():
            data = json.loads(samples.read_text())
            for row in data:
                yield row
        else:
            yield {"employee_id": "E-001", "name": "Analyst One", "department": "Finance"}


