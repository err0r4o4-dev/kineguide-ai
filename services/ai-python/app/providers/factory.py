from app.core.config import Settings
from app.providers.base import LLMProvider
from app.providers.disabled import DisabledProvider
from app.providers.mock import MockProvider


def create_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "disabled":
        return DisabledProvider()
    if settings.llm_provider == "mock":
        return MockProvider()
    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")
