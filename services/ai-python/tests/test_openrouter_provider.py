import json

import httpx
import pytest

from app.core.config import Settings
from app.providers.openrouter import OpenRouterProvider


@pytest.mark.asyncio
async def test_openrouter_enforces_privacy_and_allowlisted_tools() -> None:
    captured: dict[str, object] = {}

    def handle(request: httpx.Request) -> httpx.Response:
        captured["authorization"] = request.headers.get("Authorization")
        captured["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": None,
                            "tool_calls": [
                                {
                                    "id": "call_test",
                                    "type": "function",
                                    "function": {
                                        "name": "list_pending_evidence",
                                        "arguments": "{}",
                                    },
                                }
                            ],
                        }
                    }
                ]
            },
        )

    provider = OpenRouterProvider(
        Settings(
            llm_provider="openrouter",
            llm_api_key="synthetic-test-key",
            llm_model="openai/gpt-oss-20b",
        ),
        transport=httpx.MockTransport(handle),
    )
    result = await provider.process(
        "chat", {"locale": "th", "message": "ขอดูหลักฐาน", "recent_messages": []}
    )

    payload = captured["payload"]
    assert isinstance(payload, dict)
    assert captured["authorization"] == "Bearer synthetic-test-key"
    assert payload["provider"] == {
        "zdr": True,
        "data_collection": "deny",
        "require_parameters": True,
    }
    assert payload["parallel_tool_calls"] is False
    assert {tool["function"]["name"] for tool in payload["tools"]} == {
        "list_pending_movement_demonstrations",
        "list_pending_evidence",
    }
    assert result.enabled is True
    assert result.data == {"tool_request": "list_pending_evidence"}


@pytest.mark.asyncio
async def test_openrouter_rejects_unapproved_tool_request() -> None:
    def handle(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": None,
                            "tool_calls": [
                                {
                                    "id": "call_test",
                                    "type": "function",
                                    "function": {"name": "diagnose_user", "arguments": "{}"},
                                }
                            ],
                        }
                    }
                ]
            },
        )

    provider = OpenRouterProvider(
        Settings(
            llm_provider="openrouter",
            llm_api_key="synthetic-test-key",
            llm_model="openai/gpt-oss-20b",
        ),
        transport=httpx.MockTransport(handle),
    )

    result = await provider.process(
        "chat", {"locale": "en", "message": "test", "recent_messages": []}
    )

    assert result.enabled is False
    assert result.data is None


@pytest.mark.asyncio
async def test_openrouter_does_not_forward_diagnosis_or_treatment_text() -> None:
    def handle(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": "You have a diagnosis and should perform treatment.",
                            "tool_calls": [],
                        }
                    }
                ]
            },
        )

    provider = OpenRouterProvider(
        Settings(
            llm_provider="openrouter",
            llm_api_key="synthetic-test-key",
            llm_model="openai/gpt-oss-20b",
        ),
        transport=httpx.MockTransport(handle),
    )

    result = await provider.process(
        "chat", {"locale": "en", "message": "test", "recent_messages": []}
    )

    assert "diagnosis" not in result.message.lower()
    assert "treatment" not in result.message.lower()
    assert "pending-review" in result.message.lower()
