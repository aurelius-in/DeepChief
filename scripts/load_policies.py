import hashlib
import json
import sys
import uuid
from pathlib import Path

import yaml
from services.api.app.core.db import SessionLocal
from services.api.app.models.policy_version import PolicyVersion


def checksum_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/load_policies.py <directory>")
        sys.exit(1)
    base = Path(sys.argv[1])
    if not base.exists():
        print(f"Directory not found: {base}")
        sys.exit(2)
    loaded = []
    sess = SessionLocal()
    for path in base.rglob("*.yaml"):
        data = path.read_bytes()
        doc = yaml.safe_load(data)
        row = {
            "path": str(path),
            "policy": doc.get("policy"),
            "version": doc.get("version"),
            "checksum": checksum_bytes(data),
        }
        loaded.append(row)
        # Upsert simplistic
        existing = (
            sess.query(PolicyVersion)
            .filter(PolicyVersion.key == row["policy"]).first()
        )
        if existing:
            existing.yaml = data.decode('utf-8')
            existing.checksum = row["checksum"]
            existing.active = True
        else:
            sess.add(PolicyVersion(
                id=str(uuid.uuid4()),
                key=row["policy"],
                yaml=data.decode('utf-8'),
                checksum=row["checksum"],
                active=True,
            ))
    sess.commit()
    sess.close()
    print(json.dumps({"loaded": loaded}, indent=2))


if __name__ == "__main__":
    main()


