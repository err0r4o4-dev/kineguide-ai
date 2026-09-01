from app.core.config import Settings
from app.providers.base import LLMProvider
from app.providers.disabled import DisabledProvider
from app.providers.mock import MockProvider
from app.providers.openrouter import OpenRouterProvider


def create_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "disabled":
        return DisabledProvider()
    if settings.llm_provider == "mock":
        return MockProvider()
    if settings.llm_provider == "openrouter":
        return OpenRouterProvider(settings)
    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")
