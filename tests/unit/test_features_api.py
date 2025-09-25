from fastapi.testclient import TestClient

from services.api.app.main import app


def test_features_get_put_single():
    client = TestClient(app)
    r = client.get('/features')
    assert r.status_code == 200
    body = r.json()
    assert 'flags' in body

    # Toggle a single flag
    r = client.put('/features/flux', json={'value': False})
    assert r.status_code == 200
    body = r.json()
    assert body.get('flux') is False

    # Verify via full GET
    r = client.get('/features')
    flags = r.json().get('flags', {})
    assert flags.get('flux') is False

