import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_rejects_secret_for_disabled_provider() -> None:
    with pytest.raises(ValidationError, match="must be empty"):
        Settings(llm_provider="disabled", llm_api_key="should-not-be-here")


def test_rejects_invalid_port() -> None:
    with pytest.raises(ValidationError):
        Settings(ai_port=70_000)
