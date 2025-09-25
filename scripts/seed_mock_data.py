from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path
from random import Random


def generate_samples(days: int = 60, seed: int = 42) -> dict:
    rnd = Random(seed)
    start = date.today() - timedelta(days=days)
    gl_entries = []
    bank_txns = []
    for i in range(days):
        d = start + timedelta(days=i)
        cash_amt = round(rnd.uniform(-5000, 5000), 2)
        ar_amt = round(max(0.0, rnd.gauss(2000, 800)), 2)
        gl_entries.append({
            "id": f"gl_{i}_cash",
            "entity_id": "E1",
            "account": "Cash",
            "amount": cash_amt,
            "date": d.isoformat(),
            "source_ref": "seed",
        })
        gl_entries.append({
            "id": f"gl_{i}_ar",
            "entity_id": "E1",
            "account": "AR",
            "amount": ar_amt,
            "date": d.isoformat(),
            "source_ref": "seed",
        })
        # Bank mirrors cash with timing noise
        bank_txn = {
            "id": f"bnk_{i}",
            "account_ref": "Cash",
            "amount": cash_amt,
            "date": (d + timedelta(days=rnd.choice([0, 0, 1]))).isoformat(),
            "metadata": {"memo": "seed"},
        }
        # sprinkle bank change flags
        if i % 17 == 0:
            bank_txn["metadata"]["bank_change"] = True
        bank_txns.append(bank_txn)
    return {"gl_entry": gl_entries, "bank_txn": bank_txns}


def write_samples(out_dir: Path, data: dict) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "gl_entry.json").write_text(json.dumps(data["gl_entry"], indent=2))
    (out_dir / "bank_txn.json").write_text(json.dumps(data["bank_txn"], indent=2))


def main() -> None:
    samples = generate_samples()
    out = Path("data/samples")
    write_samples(out, samples)
    print(f"Wrote samples to {out}")


if __name__ == "__main__":
    main()


