import argparse
import base64
import hashlib
import json
import requests
from nacl import signing


def sha256_b64(data: bytes) -> str:
    return base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')


def verify(payload_url: str, signature_b64: str, public_key_b64: str) -> dict:
    r = requests.get(payload_url, timeout=10)
    r.raise_for_status()
    payload = r.content
    payload_hash_b64 = sha256_b64(payload)
    vk = signing.VerifyKey(base64.b64decode(public_key_b64))
    try:
        vk.verify(base64.b64decode(payload_hash_b64), base64.b64decode(signature_b64))
        return {"hash_b64": payload_hash_b64, "signature_valid": True}
    except Exception:
        return {"hash_b64": payload_hash_b64, "signature_valid": False}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--payload-url', required=True)
    ap.add_argument('--signature-b64', required=True)
    ap.add_argument('--public-key-b64', required=True)
    args = ap.parse_args()
    result = verify(args.payload_url, args.signature_b64, args.public_key_b64)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()


