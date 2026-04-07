"""Async Redis client for caching, rate limiting, and OTP storage."""

from redis.asyncio import Redis

from src.core.config import get_settings

_redis_client: Redis | None = None


async def get_redis() -> Redis:
    """Get or create the async Redis client singleton."""
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    return _redis_client


async def close_redis() -> None:
    """Close the Redis connection on shutdown."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
