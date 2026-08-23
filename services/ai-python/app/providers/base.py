from typing import Any, Protocol

from pydantic import BaseModel


class ProviderResult(BaseModel):
    enabled: bool
    provider: str
    message: str
    data: dict[str, Any] | None = None


class LLMProvider(Protocol):
    @property
    def name(self) -> str: ...

    async def is_ready(self) -> bool: ...

    async def process(self, task: str, payload: dict[str, Any]) -> ProviderResult: ...
