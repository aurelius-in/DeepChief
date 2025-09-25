from fastapi.testclient import TestClient

from services.api.app.main import app


def test_csv_exports_and_deps_health():
    client = TestClient(app)
    # CSVs
    for path in [
        "/gl_entries.csv",
        "/bank_txns.csv",
        "/matches.csv",
        "/exceptions.csv",
        "/controls/latest.csv",
        "/flux/flux.csv",
        "/forecast/forecast.csv",
        "/spend/spend.csv",
        "/apps/billing/invoices.csv",
        "/apps/hris/employees.csv",
    ]:
        r = client.get(path)
        assert r.status_code == 200
        assert ",receipt_id" in r.text.splitlines()[0]

    # Deps health
    r = client.get("/health/deps")
    assert r.status_code == 200
    body = r.json()
    assert set(["db", "redis", "minio"]).issubset(body.keys())


