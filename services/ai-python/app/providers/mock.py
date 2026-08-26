from typing import Any

from app.providers.base import ProviderResult


class MockProvider:
    """Deterministic development provider with non-clinical fixture output."""

    @property
    def name(self) -> str:
        return "mock"

    async def is_ready(self) -> bool:
        return True

    async def process(self, task: str, payload: dict[str, Any]) -> ProviderResult:
        if task != "chat":
            return ProviderResult(
                enabled=False,
                provider=self.name,
                message="Unsupported mock task.",
            )
        locale = payload.get("locale")
        message = (
            "นี่คือคำตอบจำลองสำหรับทดสอบระบบ ไม่ใช่คำแนะนำทางการแพทย์"
            if locale == "th"
            else "This is a mock system response, not medical advice."
        )
        return ProviderResult(enabled=True, provider=self.name, message=message)
