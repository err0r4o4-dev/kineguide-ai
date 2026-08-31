from typing import Any, Literal

import httpx
from pydantic import BaseModel, ConfigDict, ValidationError

from app.core.config import Settings
from app.providers.base import ProviderResult

AllowedTool = Literal[
    "list_pending_movement_demonstrations",
    "list_pending_evidence",
]

ALLOWED_TOOLS: tuple[AllowedTool, ...] = (
    "list_pending_movement_demonstrations",
    "list_pending_evidence",
)

SYSTEM_PROMPT = """You are the bounded KineGuide educational prototype agent.
Never diagnose, decide medical safety, prescribe treatment, select an exercise as suitable
for a person's symptoms, or create sets, repetitions, intensity, or duration. Do not invent
red flags, contraindications, evidence, or clinical claims. Exercise and evidence records
are pending clinical review and not for clinical use. For a request to see demonstrations,
call list_pending_movement_demonstrations. For evidence or a claim requiring sources, call
list_pending_evidence. Otherwise provide concise educational navigation and clearly state
the prototype boundary. Never claim that a technical camera count means correct form."""


class _Function(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    arguments: str


class _ToolCall(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    type: Literal["function"]
    function: _Function


class _Message(BaseModel):
    model_config = ConfigDict(extra="ignore")

    content: str | None = None
    tool_calls: list[_ToolCall] = []


class _Choice(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message: _Message


class _OpenRouterResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    choices: list[_Choice]


class OpenRouterProvider:
    def __init__(
        self,
        settings: Settings,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._settings = settings
        self._transport = transport

    @property
    def name(self) -> str:
        return "openrouter"

    async def is_ready(self) -> bool:
        return bool(self._settings.llm_api_key and self._settings.llm_model)

    async def process(self, task: str, payload: dict[str, Any]) -> ProviderResult:
        if task != "chat" or not await self.is_ready():
            return self._unavailable()

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for item in payload.get("recent_messages", [])[-10:]:
            if item.get("role") in {"user", "assistant"} and isinstance(item.get("content"), str):
                messages.append({"role": item["role"], "content": item["content"][:4000]})
        messages.append({"role": "user", "content": str(payload.get("message", ""))[:4000]})

        request_payload = {
            "model": self._settings.llm_model,
            "messages": messages,
            "temperature": 0,
            "max_tokens": 600,
            "parallel_tool_calls": False,
            "provider": {
                "zdr": True,
                "data_collection": "deny",
                "require_parameters": True,
            },
            "tools": [self._tool_schema(name) for name in ALLOWED_TOOLS],
        }
        try:
            async with httpx.AsyncClient(
                timeout=self._settings.request_timeout_seconds,
                transport=self._transport,
            ) as client:
                response = await client.post(
                    f"{str(self._settings.llm_base_url).rstrip('/')}/chat/completions",
                    headers={"Authorization": f"Bearer {self._settings.llm_api_key}"},
                    json=request_payload,
                )
                response.raise_for_status()
            parsed = _OpenRouterResponse.model_validate(response.json())
        except (httpx.HTTPError, ValueError, ValidationError):
            return self._unavailable()

        if not parsed.choices:
            return self._unavailable()
        message = parsed.choices[0].message
        if message.tool_calls:
            name = message.tool_calls[0].function.name
            if name not in ALLOWED_TOOLS:
                return self._unavailable()
            return ProviderResult(
                enabled=True,
                provider=self.name,
                message="Pending-review content requested.",
                data={"tool_request": name},
            )
        if not (message.content or "").strip():
            return self._unavailable()
        locale = payload.get("locale")
        safe_message = (
            "I can help you browse pending-review movement demonstrations or "
            "references in this educational prototype."
        )
        if locale == "th":
            safe_message = (
                "ฉันช่วยเปิดรายการท่าสาธิตหรือเอกสารอ้างอิงที่ยังรอผู้เชี่ยวชาญตรวจสอบในต้นแบบเพื่อการศึกษานี้ได้"
            )
        return ProviderResult(enabled=True, provider=self.name, message=safe_message)

    @staticmethod
    def _tool_schema(name: AllowedTool) -> dict[str, Any]:
        descriptions = {
            "list_pending_movement_demonstrations": (
                "List demo movements that are pending clinical review; never imply suitability."
            ),
            "list_pending_evidence": (
                "List references recorded as pending clinical review; never approve or "
                "interpret them."
            ),
        }
        return {
            "type": "function",
            "function": {
                "name": name,
                "description": descriptions[name],
                "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
            },
        }

    def _unavailable(self) -> ProviderResult:
        return ProviderResult(
            enabled=False,
            provider=self.name,
            message="AI text generation is currently unavailable.",
        )
