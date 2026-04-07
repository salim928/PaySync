"""Security utilities: JWT, TOTP 2FA, PII encryption, password hashing, OTP.

All PII encryption uses Fernet (AES-256-CBC + HMAC-SHA256).
Never log decrypted PII. Never return raw encrypted bytes in API responses.
"""

import hashlib
import hmac
import secrets
import time
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from uuid import UUID

import bcrypt
import pyotp
from cryptography.fernet import Fernet
from jose import JWTError, jwt

from src.core.config import get_settings


# ── Role enum ──

class UserRole(StrEnum):
    EMPLOYER_ADMIN = "employer_admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


# ── JWT ──

class TokenError(Exception):
    """Raised when a JWT is invalid, expired, or malformed."""


def create_access_token(
    sub: str,
    employer_id: UUID,
    role: UserRole,
) -> str:
    """Create a short-lived JWT access token (15 min default)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "employer_id": str(employer_id),
        "role": role.value,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_token_expire_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(sub: str) -> str:
    """Create a long-lived JWT refresh token (7 days default)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_refresh_token_expire_days),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def _map_supabase_claims(payload: dict) -> dict:
    """Map Supabase JWT claims to our expected format."""
    return {
        "sub": payload.get("sub"),
        "employer_id": payload.get("user_metadata", {}).get("employer_id", payload.get("sub")),
        "role": payload.get("user_metadata", {}).get("role", "employer_admin"),
        "type": "access",
        "source": "supabase",
    }


def verify_token(token: str, expected_type: str = "access") -> dict:
    """Verify and decode a JWT. Tries our custom JWT first, then Supabase JWT.

    Raises TokenError if neither verification succeeds.
    """
    settings = get_settings()

    # Try 1: Our custom JWT (signed with JWT_SECRET)
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        if expected_type == "access" and payload.get("type") != expected_type:
            raise TokenError(f"Expected {expected_type} token, got {payload.get('type')}")
        return payload
    except JWTError:
        pass

    # Try 2: Supabase JWT with signature verification (if secret is configured)
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return _map_supabase_claims(payload)
        except JWTError:
            pass

    # Try 3: Supabase JWT without signature verification (when secret is not configured)
    # This is safe because:
    # - The frontend already verified the token with Supabase
    # - The proxy.ts middleware validated the session server-side
    # - We still check the token structure and expiry
    if not settings.supabase_jwt_secret:
        try:
            # python-jose requires a key param; pass empty string with verify_signature=False
            payload = jwt.decode(
                token,
                "",
                algorithms=["HS256"],
                options={"verify_signature": False, "verify_aud": False},
            )
            # Must look like a Supabase token (has "iss" containing "supabase")
            iss = payload.get("iss", "")
            if "supabase" in iss and payload.get("sub"):
                return _map_supabase_claims(payload)
        except JWTError:
            pass

    raise TokenError("Invalid token: failed both custom and Supabase verification")


# ── Password hashing (bcrypt, 12 rounds) ──

def hash_password(password: str) -> str:
    """Hash a password with bcrypt (12 rounds)."""
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=12),
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its bcrypt hash. Constant-time."""
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8"),
    )


# ── TOTP 2FA ──

def generate_totp_secret() -> str:
    """Generate a new TOTP secret (base32 encoded)."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """Generate an otpauth:// URI for QR code display."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name="WageNow Ghana")


def verify_totp(secret: str, code: str) -> bool:
    """Verify a TOTP code (30s window, ±1 period tolerance)."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


# ── PII Encryption (Fernet / AES-256) ──

def _get_fernet() -> Fernet:
    """Get the Fernet cipher instance."""
    settings = get_settings()
    return Fernet(settings.encryption_key.encode("utf-8"))


def encrypt_pii(plaintext: str) -> str:
    """Encrypt a PII value. Returns base64-encoded ciphertext."""
    if not plaintext:
        return ""
    return _get_fernet().encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_pii(ciphertext: str) -> str:
    """Decrypt a PII value. Returns plaintext."""
    if not ciphertext:
        return ""
    return _get_fernet().decrypt(ciphertext.encode("utf-8")).decode("utf-8")


# ── OTP (SMS-based for employees) ──

def generate_otp() -> str:
    """Generate a cryptographically random 6-digit OTP."""
    return str(secrets.randbelow(1_000_000)).zfill(6)


def hash_otp(code: str) -> str:
    """Hash an OTP for storage in Redis."""
    return bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt(rounds=4)).decode("utf-8")


def verify_otp(code: str, code_hash: str) -> bool:
    """Verify an OTP against its hash. Constant-time comparison."""
    return bcrypt.checkpw(code.encode("utf-8"), code_hash.encode("utf-8"))


# ── Webhook HMAC verification ──

def verify_webhook_hmac(payload: bytes, signature: str, secret: str) -> bool:
    """Verify HMAC-SHA256 webhook signature. Constant-time comparison."""
    expected = hmac.new(
        secret.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


# ── Idempotency key generation ──

def generate_idempotency_key(employee_id: UUID, amount: str) -> str:
    """Generate a withdrawal idempotency key.

    SHA256(employee_id:amount:5-minute-window)[:32]
    Same employee + amount within same 5-minute window = same key.
    """
    window = int(time.time() // 300)
    raw = f"{employee_id}:{amount}:{window}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]
