"""Unit tests for security utilities: hashing, encryption, JWT, OTP, HMAC."""

import os
from uuid import uuid4

import pytest

# Set test env vars BEFORE importing security module
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long!")
os.environ.setdefault("ENCRYPTION_KEY", "9f8k7j6h5g4f3d2s1a0p9o8i7u6y5t4r=")
os.environ.setdefault("HUBTEL_CLIENT_ID", "test")
os.environ.setdefault("HUBTEL_CLIENT_SECRET", "test")
os.environ.setdefault("MOMO_WEBHOOK_SECRET", "test-webhook-secret")
os.environ.setdefault("TWILIO_ACCOUNT_SID", "test")
os.environ.setdefault("TWILIO_AUTH_TOKEN", "test")
os.environ.setdefault("TWILIO_PHONE_NUMBER", "+1234567890")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test")


class TestPasswordHashing:
    def test_hash_and_verify(self) -> None:
        from src.core.security import hash_password, verify_password

        pw = "MySecureP@ss123"
        hashed = hash_password(pw)

        assert hashed != pw
        assert verify_password(pw, hashed)
        assert not verify_password("wrong", hashed)

    def test_different_hashes_same_password(self) -> None:
        from src.core.security import hash_password

        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2  # bcrypt uses random salt


class TestOTP:
    def test_generate_otp_format(self) -> None:
        from src.core.security import generate_otp

        for _ in range(100):
            code = generate_otp()
            assert len(code) == 6
            assert code.isdigit()

    def test_otp_hash_and_verify(self) -> None:
        from src.core.security import generate_otp, hash_otp, verify_otp

        code = generate_otp()
        hashed = hash_otp(code)

        assert verify_otp(code, hashed)
        assert not verify_otp("000000", hashed)


class TestIdempotencyKey:
    def test_same_inputs_same_window(self) -> None:
        from src.core.security import generate_idempotency_key

        eid = uuid4()
        k1 = generate_idempotency_key(eid, "400.00")
        k2 = generate_idempotency_key(eid, "400.00")
        assert k1 == k2  # Same 5-minute window

    def test_different_amounts_different_keys(self) -> None:
        from src.core.security import generate_idempotency_key

        eid = uuid4()
        k1 = generate_idempotency_key(eid, "400.00")
        k2 = generate_idempotency_key(eid, "500.00")
        assert k1 != k2

    def test_different_employees_different_keys(self) -> None:
        from src.core.security import generate_idempotency_key

        k1 = generate_idempotency_key(uuid4(), "400.00")
        k2 = generate_idempotency_key(uuid4(), "400.00")
        assert k1 != k2

    def test_key_length(self) -> None:
        from src.core.security import generate_idempotency_key

        key = generate_idempotency_key(uuid4(), "100.00")
        assert len(key) == 32


class TestWebhookHMAC:
    def test_valid_signature(self) -> None:
        from src.core.security import verify_webhook_hmac

        import hashlib, hmac

        secret = "test-secret"
        payload = b'{"ResponseCode":"0000"}'
        sig = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

        assert verify_webhook_hmac(payload, sig, secret)

    def test_invalid_signature(self) -> None:
        from src.core.security import verify_webhook_hmac

        assert not verify_webhook_hmac(b"payload", "bad-sig", "secret")

    def test_empty_signature(self) -> None:
        from src.core.security import verify_webhook_hmac

        assert not verify_webhook_hmac(b"payload", "", "secret")


class TestPIIEncryption:
    def test_encrypt_decrypt_roundtrip(self) -> None:
        """Skip if Fernet key is not a valid key (test env)."""
        from cryptography.fernet import Fernet

        # Generate a real Fernet key for this test
        real_key = Fernet.generate_key().decode()
        os.environ["ENCRYPTION_KEY"] = real_key

        # Clear cached settings
        from src.core.config import get_settings
        get_settings.cache_clear()

        from src.core.security import decrypt_pii, encrypt_pii

        original = "0241234567"
        encrypted = encrypt_pii(original)

        assert encrypted != original
        assert decrypt_pii(encrypted) == original

    def test_empty_string(self) -> None:
        from src.core.security import decrypt_pii, encrypt_pii

        assert encrypt_pii("") == ""
        assert decrypt_pii("") == ""
