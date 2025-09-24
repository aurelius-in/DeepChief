from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
import json
from typing import Iterable, Dict, Any


class BankClient(ABC):
    @abstractmethod
    def iter_bank_txns(self) -> Iterable[Dict[str, Any]]:
        ...


class BankMock(BankClient):
    def __init__(self, samples_dir: Path = Path('data/samples')) -> None:
        self.samples_dir = samples_dir

    def iter_bank_txns(self) -> Iterable[Dict[str, Any]]:
        data = json.loads((self.samples_dir / 'bank_txn.json').read_text())
        for row in data:
            yield row


