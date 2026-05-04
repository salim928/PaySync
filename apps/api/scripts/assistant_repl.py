"""Interactive REPL for the assistant — bypasses the HTTP layer.

Usage:
    cd apps/api
    python -m scripts.assistant_repl <employer_id_uuid>

Loads .env, opens a DB session, then runs run_turn() in a loop.
Useful for testing tool calls against real data without spinning up the
frontend or generating a JWT.
"""

from __future__ import annotations

import asyncio
import sys
from uuid import UUID, uuid4

from src.core.database import get_session_factory
from src.services.assistant.agent import run_turn


async def main(employer_id: UUID) -> None:
    fake_actor = uuid4()  # audit log stub — real chats use the JWT sub
    history: list = []

    session_factory = get_session_factory()
    print(f"PaySync assistant REPL — employer_id={employer_id}")
    print("Type a message and press Enter. Ctrl-C to quit.\n")

    while True:
        try:
            user_input = input("you> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nbye.")
            return
        if not user_input:
            continue

        async with session_factory() as db:
            try:
                result = await run_turn(
                    db=db,
                    employer_id=employer_id,
                    actor_id=fake_actor,
                    user_message=user_input,
                    history=history,
                )
                await db.commit()
            except Exception as e:  # noqa: BLE001
                print(f"[error] {type(e).__name__}: {e}")
                continue

        history = result["messages"]
        if result["tool_calls"]:
            tool_summary = ", ".join(t["name"] for t in result["tool_calls"])
            print(f"[tools used: {tool_summary}]")
        print(f"assistant> {result['reply']}\n")
        print(
            f"[usage: in={result['usage']['input_tokens']} "
            f"out={result['usage']['output_tokens']} "
            f"cache_read={result['usage']['cache_read_input_tokens']} "
            f"cache_write={result['usage']['cache_creation_input_tokens']}]\n"
        )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python -m scripts.assistant_repl <employer_id_uuid>")
        sys.exit(1)
    asyncio.run(main(UUID(sys.argv[1])))
