import base64
from fastapi.testclient import TestClient
from nacl import signing

from services.api.app.main import app


def test_verify_signature_roundtrip():
    client = TestClient(app)
    sk = signing.SigningKey.generate()
    vk = sk.verify_key
    payload_hash_b64 = base64.b64encode(b"0" * 32).decode("ascii")
    signature_b64 = base64.b64encode(sk.sign(base64.b64decode(payload_hash_b64)).signature).decode("ascii")
    public_key_b64 = base64.b64encode(bytes(vk)).decode("ascii")

    r = client.post("/receipts/verify", json={
        "payload_hash_b64": payload_hash_b64,
        "signature_b64": signature_b64,
        "public_key_b64": public_key_b64,
    })
    assert r.status_code == 200
    assert r.json()["valid"] is True


