"""FastAPI application factory.

Configures: CORS, structured logging, auth middleware, lifespan (startup/shutdown),
health check, and registers all routers.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import get_settings
from src.core.redis import close_redis, get_redis
from src.core.security import TokenError, verify_token
from src.routers import auth, employees, employers, ewa, webhooks

# ── Structured logging ──
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(0),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown hooks."""
    logger.info("wagenow_starting", environment=get_settings().environment)

    # Warm up Redis connection (optional in development)
    try:
        redis = await get_redis()
        await redis.ping()
        logger.info("redis_connected")
    except Exception:
        logger.warning("redis_unavailable", msg="Redis not running — rate limiting and OTP disabled")

    yield

    # Shutdown
    await close_redis()
    logger.info("wagenow_shutdown")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="WageNow Ghana API",
        description="Earned Wage Access + Corporate Spend Management for Ghana",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # ── CORS ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Auth middleware ──
    @app.middleware("http")
    async def auth_middleware(request: Request, call_next) -> Response:
        """Extract and verify JWT from Authorization header.

        Sets request.state.sub, request.state.employer_id, request.state.role
        for downstream route handlers. Skips auth for public routes.
        """
        # Public routes that don't need auth
        public_paths = {
            "/docs", "/redoc", "/openapi.json",
            "/api/v1/health",
            "/api/v1/auth/employer/register",
            "/api/v1/auth/employer/login",
            "/api/v1/auth/employee/otp/request",
            "/api/v1/auth/employee/otp/verify",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/webhooks/momo/callback",
            "/webhooks/whatsapp",
        }

        if request.url.path in public_paths:
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"type": "about:blank", "title": "Unauthorized",
                         "status": 401, "detail": "Missing or invalid Authorization header"},
            )

        token = auth_header[7:]
        try:
            payload = verify_token(token, expected_type="access")
        except TokenError:
            return JSONResponse(
                status_code=401,
                content={"type": "about:blank", "title": "Unauthorized",
                         "status": 401, "detail": "Invalid or expired token"},
            )

        request.state.sub = payload.get("sub")
        request.state.employer_id = payload.get("employer_id")
        request.state.role = payload.get("role")

        return await call_next(request)

    # ── Routers ──
    app.include_router(auth.router)
    app.include_router(employees.router)
    app.include_router(employers.router)
    app.include_router(ewa.router)
    app.include_router(webhooks.router)

    # ── Health check ──
    @app.get("/api/v1/health")
    async def health_check() -> dict:
        """Health check: DB, Redis, Celery status."""
        from sqlalchemy import text as sa_text
        from src.core.database import get_engine
        engine = get_engine()

        health = {"status": "ok", "db": "unknown", "redis": "unknown", "celery": "unknown"}

        # DB check
        try:
            async with engine.connect() as conn:
                await conn.execute(sa_text("SELECT 1"))
            health["db"] = "ok"
        except Exception:
            health["db"] = "fail"
            health["status"] = "degraded"

        # Redis check
        try:
            redis = await get_redis()
            await redis.ping()
            health["redis"] = "ok"
        except Exception:
            health["redis"] = "fail"
            health["status"] = "degraded"

        # Celery check (ping worker)
        try:
            from src.services.workers.tasks import celery_app as _celery
            insp = _celery.control.inspect(timeout=2.0)
            if insp.ping():
                health["celery"] = "ok"
            else:
                health["celery"] = "no_workers"
        except Exception:
            health["celery"] = "fail"

        return health

    return app


# Module-level app instance for uvicorn
app = create_app()
