import os
import pytest
from fastapi.testclient import TestClient

from services.api.app.main import app


pytestmark = pytest.mark.skipif(os.getenv("RUN_INTEGRATION") != "1", reason="Integration tests disabled (set RUN_INTEGRATION=1)")

def test_ingest_and_reconcile_flow():
    client = TestClient(app)
    r = client.post('/ingest/mock')
    assert r.status_code == 200
    r = client.post('/agents/auto_reconciler/run')
    assert r.status_code == 200
    r = client.get('/matches')
    assert r.status_code == 200
    matches = r.json()
    assert isinstance(matches, list)

