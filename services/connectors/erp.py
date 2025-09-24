from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
import json
from typing import Iterable, Dict, Any


class ERPClient(ABC):
    @abstractmethod
    def iter_gl_entries(self) -> Iterable[Dict[str, Any]]:  # normalized shape
        ...


class NetsuiteMock(ERPClient):
    def __init__(self, samples_dir: Path = Path('data/samples')) -> None:
        self.samples_dir = samples_dir

    def iter_gl_entries(self) -> Iterable[Dict[str, Any]]:
        data = json.loads((self.samples_dir / 'gl_entry.json').read_text())
        for row in data:
            yield row


