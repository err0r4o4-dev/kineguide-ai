from app.core.config import Settings
from app.providers.base import LLMProvider
from app.providers.disabled import DisabledProvider


def create_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider in {"disabled", "mock"}:
        return DisabledProvider()
    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")
