from fastapi.testclient import TestClient

from services.api.app.main import app


def test_list_job_runs():
    client = TestClient(app)
    r = client.get('/job_runs')
    assert r.status_code == 200
    assert isinstance(r.json(), list)

