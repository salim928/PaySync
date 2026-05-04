"""Assistant chat endpoint.

POST /api/v1/assistant/chat
  body: {"message": str, "history": [...] | null}
  resp: {"chat_id", "reply", "tool_calls", "messages", "usage"}

History round-trips: the client passes back the `messages` array from the
previous response unchanged. v1 is non-streaming — streaming SSE is on the
roadmap for sprint 6 polish.
"""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.services.assistant.agent import AssistantError, run_turn

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4_000)
    history: list[dict[str, Any]] | None = None


class ChatResponse(BaseModel):
    chat_id: str
    reply: str
    tool_calls: list[dict[str, Any]]
    messages: list[dict[str, Any]]
    usage: dict[str, int]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    employer_id = _get_employer_id(request)
    actor_id = _get_user_id(request)

    try:
        result = await run_turn(
            db=db,
            employer_id=employer_id,
            actor_id=actor_id,
            user_message=body.message,
            history=body.history,
        )
    except AssistantError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        logger.exception("assistant_chat_failed")
        raise HTTPException(status_code=500, detail=f"assistant error: {e}") from e

    return ChatResponse(**result)


# ── helpers (mirror the pattern in routers/employers.py) ──

def _get_employer_id(request: Request):
    from uuid import UUID

    employer_id = getattr(request.state, "employer_id", None)
    if employer_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UUID(employer_id) if isinstance(employer_id, str) else employer_id


def _get_user_id(request: Request):
    from uuid import UUID

    sub = getattr(request.state, "sub", None)
    if sub is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UUID(sub)
