from functools import lru_cache
from typing import Literal

from pydantic import Field, HttpUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: Literal["development", "test", "production"] = "development"
    app_version: str = Field(default="0.1.0", min_length=1)
    ai_host: str = "0.0.0.0"
    ai_port: int = Field(default=8001, ge=1, le=65535)
    llm_provider: Literal["disabled", "mock", "openrouter"] = "disabled"
    llm_api_key: str = ""
    llm_model: str = ""
    llm_base_url: HttpUrl = HttpUrl("https://openrouter.ai/api/v1")
    allowed_hosts: list[str] = ["localhost", "127.0.0.1", "ai-python", "testserver"]
    request_timeout_seconds: float = Field(default=10.0, gt=0, le=60)
    go_api_url: HttpUrl | None = None

    @model_validator(mode="after")
    def reject_provider_credentials(self) -> "Settings":
        if self.llm_provider in {"disabled", "mock"} and self.llm_api_key:
            raise ValueError("LLM_API_KEY must be empty while the provider is disabled or mocked")
        if self.llm_provider == "openrouter" and not (self.llm_api_key and self.llm_model):
            raise ValueError("OpenRouter requires an LLM API key and model")
        if self.app_env == "production" and self.llm_provider == "mock":
            raise ValueError("The mock LLM provider cannot be used in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
