from fastapi.testclient import TestClient

from services.api.app.main import app


def test_controls_run_and_receipts_pack():
    client = TestClient(app)
    r = client.post('/controls/run')
    assert r.status_code == 200
    data = r.json()
    rid = data.get('receipt_id')
    assert rid

    r2 = client.get(f'/receipts/pack?ids={rid}')
    assert r2.status_code == 200
    assert r2.headers.get('content-type', '').startswith('application/zip')


