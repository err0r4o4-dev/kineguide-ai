from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "ai-python",
        "version": "0.1.0",
    }


def test_versioned_health(client: TestClient) -> None:
    assert client.get("/api/v1/health").status_code == 200


def test_readiness(client: TestClient) -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["provider"] == "disabled"
