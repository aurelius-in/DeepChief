from fastapi.testclient import TestClient

from services.api.app.main import app


def test_policies_validate_endpoint():
    client = TestClient(app)
    good = """
policy: CTRL_ApprovalThreshold
version: 1.0.0
then: {}
"""
    r = client.post('/policies/validate', params={}, data=good)
    assert r.status_code == 200
    assert r.json().get('valid') is True

    bad = """
version: 1.0.0
"""
    r = client.post('/policies/validate', data=bad)
    assert r.status_code == 200
    assert r.json().get('valid') is False


