from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["ai-python"] = "ai-python"
    version: str


class ReadinessResponse(BaseModel):
    status: Literal["ok", "unavailable"]
    service: Literal["ai-python"] = "ai-python"
    version: str
    provider: str
