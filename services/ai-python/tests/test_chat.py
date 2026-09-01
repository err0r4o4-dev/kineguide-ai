import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app


def test_disabled_provider_rejects_chat_without_echoing_sensitive_input(
    client: TestClient,
) -> None:
    response = client.post(
        "/v1/chat/responses",
        json={
            "locale": "th",
            "message": "synthetic private symptom text",
            "recent_messages": [],
        },
    )

    assert response.status_code == 503
    assert response.json() == {
        "status": "unavailable",
        "message": "AI text generation is currently unavailable.",
        "tool_request": None,
    }
    assert "synthetic private symptom text" not in response.text


def test_mock_provider_returns_bounded_non_clinical_chat_response(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    get_settings.cache_clear()
    try:
        with TestClient(app) as test_client:
            response = test_client.post(
                "/v1/chat/responses",
                json={
                    "locale": "th",
                    "message": "ข้อความทดสอบทั่วไป",
                    "recent_messages": [],
                },
            )
        assert response.status_code == 200
        assert response.json() == {
            "status": "completed",
            "message": "นี่คือคำตอบจำลองสำหรับทดสอบระบบ ไม่ใช่คำแนะนำทางการแพทย์",
            "tool_request": None,
        }
    finally:
        get_settings.cache_clear()


def test_chat_rejects_oversized_message(client: TestClient) -> None:
    response = client.post(
        "/v1/chat/responses",
        json={"locale": "th", "message": "x" * 4001, "recent_messages": []},
    )

    assert response.status_code == 422
