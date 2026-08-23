from typing import Any

from app.providers.base import ProviderResult


class DisabledProvider:
    """Deterministic local provider that cannot produce medical content."""

    @property
    def name(self) -> str:
        return "disabled"

    async def is_ready(self) -> bool:
        return True

    async def process(self, task: str, payload: dict[str, Any]) -> ProviderResult:
        del task, payload
        return ProviderResult(
            enabled=False,
            provider=self.name,
            message="AI text generation is disabled; no medical advice was generated.",
            data=None,
        )
