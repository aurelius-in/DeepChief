import hashlib
import json
import sys
from pathlib import Path

import yaml


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
    for path in base.rglob("*.yaml"):
        data = path.read_bytes()
        doc = yaml.safe_load(data)
        loaded.append({
            "path": str(path),
            "policy": doc.get("policy"),
            "version": doc.get("version"),
            "checksum": checksum_bytes(data),
        })
    print(json.dumps({"loaded": loaded}, indent=2))


if __name__ == "__main__":
    main()


