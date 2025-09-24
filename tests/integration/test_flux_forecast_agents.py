from fastapi.testclient import TestClient

from services.api.app.main import app


def test_flux_and_forecast_run():
    client = TestClient(app)
    rf = client.post('/agents/flux/run')
    assert rf.status_code == 200
    rff = client.post('/agents/forecast/run')
    assert rff.status_code == 200
    lf = client.get('/flux')
    assert lf.status_code == 200
    lfo = client.get('/forecast')
    assert lfo.status_code == 200


