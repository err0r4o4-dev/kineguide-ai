from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse

from app.core.config import Settings, get_settings
from app.providers.base import LLMProvider
from app.schemas.health import HealthResponse, ReadinessResponse

router = APIRouter(tags=["system"])


def provider_from_app(request: Request) -> LLMProvider:
    return request.app.state.provider  # type: ignore[no-any-return]


@router.get("/health", response_model=HealthResponse)
@router.get("/v1/health", response_model=HealthResponse)
async def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(status="ok", version=settings.app_version)


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ReadinessResponse}},
)
async def ready(
    settings: Annotated[Settings, Depends(get_settings)],
    provider: Annotated[LLMProvider, Depends(provider_from_app)],
) -> ReadinessResponse | JSONResponse:
    ready_state = await provider.is_ready()
    response = ReadinessResponse(
        status="ok" if ready_state else "unavailable",
        version=settings.app_version,
        provider=provider.name,
    )
    if not ready_state:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response.model_dump(),
        )
    return response
