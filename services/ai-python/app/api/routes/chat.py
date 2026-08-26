from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.api.routes.health import provider_from_app
from app.providers.base import LLMProvider
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/v1/chat", tags=["chat"])


@router.post(
    "/responses",
    response_model=ChatResponse,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ChatResponse}},
)
async def create_chat_response(
    request: ChatRequest,
    provider: Annotated[LLMProvider, Depends(provider_from_app)],
) -> ChatResponse | JSONResponse:
    result = await provider.process("chat", request.model_dump())
    if not result.enabled:
        response = ChatResponse(
            status="unavailable",
            message="AI text generation is currently unavailable.",
        )
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response.model_dump(),
        )
    return ChatResponse(status="completed", message=result.message)
