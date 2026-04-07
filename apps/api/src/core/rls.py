"""Row Level Security context management.

Sets the PostgreSQL session variable `app.current_employer_id` before
any query executes, ensuring tenant isolation at the database level.
"""

from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def set_rls_context(db: AsyncSession, employer_id: UUID) -> None:
    """Set RLS context for the current database session.

    Must be called at the beginning of every request that accesses
    tenant-scoped tables (employees, ewa_transactions, etc.).

    Args:
        db: The current async database session.
        employer_id: The authenticated employer's UUID.
    """
    await db.execute(
        text("SET LOCAL app.current_employer_id = :id"),
        {"id": str(employer_id)},
    )
