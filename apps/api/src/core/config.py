"""Application configuration loaded from environment variables.

Fails fast on startup if any required secret is missing.
Never import secrets directly — always access via get_settings().
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """All application configuration. Loaded from environment variables."""

    # ── Database ──
    database_url: str = Field(..., description="PostgreSQL async connection string")
    redis_url: str = Field(default="redis://localhost:6379/0")

    # ── Auth ──
    jwt_secret: str = Field(..., min_length=32, description="JWT signing secret")
    jwt_access_token_expire_minutes: int = Field(default=15)
    jwt_refresh_token_expire_days: int = Field(default=7)

    # ── Encryption ──
    encryption_key: str = Field(..., description="Fernet key for PII encryption")

    # ── Hubtel MoMo ──
    hubtel_client_id: str = Field(default="placeholder", description="Hubtel API client ID")
    hubtel_client_secret: str = Field(default="placeholder", description="Hubtel API client secret")
    hubtel_base_url: str = Field(
        default="https://devp-hubtel-payment-proxy-api.hubtel.com"
    )
    momo_webhook_secret: str = Field(default="placeholder", description="HMAC secret for MoMo webhooks")
    momo_callback_url: str = Field(
        default="https://api.wagenow.com.gh/webhooks/momo/callback"
    )

    # ── Twilio ──
    twilio_account_sid: str = Field(default="placeholder", description="Twilio account SID")
    twilio_auth_token: str = Field(default="placeholder", description="Twilio auth token")
    twilio_phone_number: str = Field(default="placeholder", description="Twilio sender phone number")

    # ── Supabase ──
    supabase_service_key: str = Field(..., description="Supabase service role key")
    supabase_jwt_secret: str = Field(
        default="",
        description="Supabase JWT secret (Settings → API → JWT Secret). Falls back to empty = skip Supabase JWT verification."
    )
    next_public_supabase_url: str = Field(default="")
    next_public_supabase_anon_key: str = Field(default="")

    # ── App ──
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith(("postgresql", "postgres")):
            msg = "DATABASE_URL must be a PostgreSQL connection string"
            raise ValueError(msg)
        # Convert sync URL to async if needed
        if v.startswith("postgresql+asyncpg://"):
            return v
        if v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        # URL-decode the password so asyncpg doesn't choke on %XX sequences
        from urllib.parse import urlparse, urlunparse, unquote
        parsed = urlparse(v)
        if parsed.password and "%" in parsed.password:
            decoded_pw = unquote(parsed.password)
            netloc = f"{parsed.username}:{decoded_pw}@{parsed.hostname}"
            if parsed.port:
                netloc += f":{parsed.port}"
            v = urlunparse(parsed._replace(netloc=netloc))
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton. Fails fast if env vars are missing."""
    return Settings()  # type: ignore[call-arg]
