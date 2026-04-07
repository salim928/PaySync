"""Async SQLAlchemy engine, session factory, and dependency injection.

Every request gets an AsyncSession. For employer-scoped requests, RLS
context is set via SET LOCAL before any queries execute.
"""

from collections.abc import AsyncGenerator
from uuid import UUID

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from src.core.config import get_settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


_engine = None
_async_session_factory = None


def get_engine():
    """Lazily create the async engine with production-safe pool settings."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            echo=settings.debug,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={
                # Supabase pooler (port 6543) uses transaction mode which
                # doesn't support prepared statements — disable asyncpg's
                # statement cache to prevent connections from hanging.
                "statement_cache_size": 0,
                "prepared_statement_cache_size": 0,
                "server_settings": {"plan_cache_mode": "force_custom_plan"},
            },
        )
    return _engine


def get_session_factory():
    """Lazily create the async session factory."""
    global _async_session_factory
    if _async_session_factory is None:
        _async_session_factory = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_factory



async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: yields an async DB session, rolls back on error."""
    async with get_session_factory()() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_with_rls(
    employer_id: UUID,
) -> AsyncGenerator[AsyncSession, None]:
    """Yields a session with RLS context set for tenant isolation."""
    async with get_session_factory()() as session:
        try:
            await session.execute(
                text("SET LOCAL app.current_employer_id = :id"),
                {"id": str(employer_id)},
            )
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
