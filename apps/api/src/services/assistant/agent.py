"""Agent loop for the PaySync assistant.

Manual tool-use loop (not the SDK tool runner) so we can:
- Audit-log every tool call before executing it
- Drop in human-in-the-loop approval later (sprint 6+) without rewriting
- Surface tool errors as structured tool_results instead of crashing the loop

Caching strategy:
- System prompt + tool definitions are stable per deploy → cache them together
  by placing cache_control on the last system text block. tools render before
  system, so one breakpoint covers both. See shared/prompt-caching.md.
- Conversation history goes in messages, after the cache breakpoint, and is
  the only varying part per request.

Model: claude-opus-4-7 with adaptive thinking. Read-only + draft only —
no destructive actions are wired up.
"""

from __future__ import annotations

import json
from typing import Any
from uuid import UUID, uuid4

import anthropic
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.models import AuditLog
from src.services.assistant.handlers import HANDLERS
from src.services.assistant.prompts import SYSTEM_PROMPT
from src.services.assistant.tools import TOOL_DEFINITIONS

logger = structlog.get_logger()

MODEL = "claude-opus-4-7"
MAX_TOKENS = 16_000
MAX_TOOL_ITERATIONS = 8  # safety cap on the agent loop


class AssistantError(Exception):
    """Raised when the assistant cannot complete a turn (config, API, or fatal tool error)."""


def _client() -> anthropic.AsyncAnthropic:
    settings = get_settings()
    if not settings.anthropic_api_key or settings.anthropic_api_key == "placeholder":
        raise AssistantError(
            "ANTHROPIC_API_KEY is not configured. Set it in the API environment "
            "to enable the assistant."
        )
    return anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def _audit(
    db: AsyncSession,
    *,
    actor_id: UUID,
    action: str,
    chat_id: UUID,
    metadata: dict[str, Any],
) -> None:
    """Write an entry to audit_logs.

    Each chat turn gets a UUID (chat_id) attached to every related row so
    the full trace can be reconstructed by querying audit_logs.metadata->>'chat_id'.
    """
    db.add(
        AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type="assistant_chat",
            entity_id=chat_id,
            event_metadata={"chat_id": str(chat_id), **metadata},
        )
    )
    # Flush so the audit row is visible even if the request later errors.
    # The outer get_db() dependency commits at end-of-request.
    await db.flush()


async def _execute_tool(
    db: AsyncSession,
    employer_id: UUID,
    tool_name: str,
    tool_input: dict[str, Any],
) -> dict[str, Any]:
    handler = HANDLERS.get(tool_name)
    if handler is None:
        return {"error": f"unknown tool: {tool_name}"}
    try:
        return await handler(db, employer_id, **tool_input)
    except TypeError as e:
        return {"error": f"bad tool input: {e}"}
    except Exception as e:  # noqa: BLE001 — surface any error back to Claude
        logger.exception("assistant_tool_error", tool=tool_name)
        return {"error": f"tool execution failed: {type(e).__name__}: {e}"}


def _system_blocks() -> list[dict[str, Any]]:
    """System prompt as a single cacheable block.

    Only the LAST cacheable block needs the breakpoint; tools are rendered
    before system, so this one marker caches tools + system together.
    """
    return [
        {
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        }
    ]


async def run_turn(
    *,
    db: AsyncSession,
    employer_id: UUID,
    actor_id: UUID,
    user_message: str,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Run one user turn through the assistant.

    Args:
        db: Active DB session (employer-scoped via RLS / explicit filtering).
        employer_id: Tenant scope. Every tool call is filtered by this.
        actor_id: User-id of the human asking (for audit).
        user_message: The human's text input for this turn.
        history: Prior messages (assistant + user, alternating). Pass back
            unchanged from the previous turn's response to maintain context.

    Returns:
        {
            "chat_id": UUID,
            "reply": str,                     # final assistant text
            "tool_calls": [{name, input, result_summary}],
            "messages": [...],                # updated history to round-trip back
            "usage": {input_tokens, output_tokens, cache_read, cache_creation},
        }
    """
    chat_id = uuid4()
    client = _client()

    messages: list[dict[str, Any]] = list(history or [])
    messages.append({"role": "user", "content": user_message})

    await _audit(
        db,
        actor_id=actor_id,
        action="assistant.chat.turn_start",
        chat_id=chat_id,
        metadata={"user_message_chars": len(user_message)},
    )

    tool_calls_made: list[dict[str, Any]] = []
    final_text = ""
    usage_total = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_input_tokens": 0,
        "cache_creation_input_tokens": 0,
    }

    for iteration in range(MAX_TOOL_ITERATIONS):
        response = await client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            thinking={"type": "adaptive"},
            system=_system_blocks(),
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        # Accumulate token usage across the loop.
        for k in usage_total:
            usage_total[k] += getattr(response.usage, k, 0) or 0

        # Append the assistant turn (text + tool_use blocks, plus thinking blocks
        # which the API requires us to round-trip when extended thinking is used).
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            final_text = "\n".join(
                b.text for b in response.content if getattr(b, "type", None) == "text"
            )
            break

        if response.stop_reason != "tool_use":
            # Unexpected stop (refusal, max_tokens, etc.) — return what we have.
            final_text = "\n".join(
                getattr(b, "text", "") for b in response.content if getattr(b, "type", None) == "text"
            ) or f"[assistant stopped: {response.stop_reason}]"
            break

        # Execute every tool_use block in this assistant turn.
        tool_results: list[dict[str, Any]] = []
        for block in response.content:
            if getattr(block, "type", None) != "tool_use":
                continue

            tool_name = block.name
            tool_input = block.input or {}

            await _audit(
                db,
                actor_id=actor_id,
                action=f"assistant.tool.{tool_name}",
                chat_id=chat_id,
                metadata={"tool_input": tool_input},
            )

            result = await _execute_tool(db, employer_id, tool_name, tool_input)
            tool_calls_made.append({
                "name": tool_name,
                "input": tool_input,
                "result_keys": list(result.keys()) if isinstance(result, dict) else None,
            })

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result, default=str),
            })

        if not tool_results:
            # Defensive: stop_reason was tool_use but no tool_use blocks found.
            break

        messages.append({"role": "user", "content": tool_results})
    else:
        # MAX_TOOL_ITERATIONS exhausted.
        logger.warning("assistant_max_iterations", chat_id=str(chat_id))
        final_text = (
            final_text
            or "[assistant ran out of tool-call iterations — please rephrase or simplify the request]"
        )

    await _audit(
        db,
        actor_id=actor_id,
        action="assistant.chat.turn_end",
        chat_id=chat_id,
        metadata={
            "tool_call_count": len(tool_calls_made),
            "reply_chars": len(final_text),
            "usage": usage_total,
        },
    )

    return {
        "chat_id": str(chat_id),
        "reply": final_text,
        "tool_calls": tool_calls_made,
        "messages": messages,
        "usage": usage_total,
    }
