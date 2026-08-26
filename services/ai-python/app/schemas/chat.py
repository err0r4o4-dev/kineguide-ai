from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    locale: Literal["th", "en"]
    message: str = Field(min_length=1, max_length=4000)
    recent_messages: list[ChatMessage] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["completed", "unavailable"]
    message: str = Field(min_length=1, max_length=4000)
