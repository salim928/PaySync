"""Twilio SMS service for OTP delivery and withdrawal confirmations.

OTP storage: Redis key 'otp:{phone}', TTL 600s (10 min), value = bcrypt hash.
OTP format: 6 digits, cryptographically random.
On verify: constant-time comparison, then DELETE key immediately on success.
"""

import structlog
from redis.asyncio import Redis

from src.core.config import get_settings
from src.core.security import generate_otp, hash_otp, verify_otp

logger = structlog.get_logger()

OTP_TTL_SECONDS = 600  # 10 minutes
OTP_RATE_LIMIT_MAX = 5
OTP_RATE_LIMIT_WINDOW = 900  # 15 minutes


class SMSError(Exception):
    """Raised when SMS delivery fails."""


class SMSService:
    """Sends SMS via Twilio and manages OTP lifecycle in Redis."""

    def __init__(self, redis: Redis) -> None:
        self._redis = redis
        self._settings = get_settings()

    async def send_otp(self, phone: str) -> None:
        """Generate, store, and send an OTP via SMS.

        Args:
            phone: E.164 phone number (+233XXXXXXXXX).

        Raises:
            SMSError: If rate limit exceeded or SMS delivery fails.
        """
        # Rate limit: 5 OTP requests per 15 minutes per phone
        await self._check_otp_rate_limit(phone)

        code = generate_otp()
        code_hash = hash_otp(code)

        # Store hashed OTP in Redis
        otp_key = f"otp:{phone}"
        await self._redis.setex(otp_key, OTP_TTL_SECONDS, code_hash)

        # Send via Twilio
        message = f"Your WageNow OTP is {code}. Valid for 10 minutes. Do not share."
        await self._send_sms(phone, message)

        logger.info("otp_sent", phone=phone[-4:])  # Log only last 4 digits

    async def verify_otp_code(self, phone: str, code: str) -> bool:
        """Verify an OTP code. Deletes on success (one-time use).

        Args:
            phone: E.164 phone number.
            code: The 6-digit code to verify.

        Returns:
            True if valid, False if invalid or expired.
        """
        otp_key = f"otp:{phone}"
        stored_hash = await self._redis.get(otp_key)

        if stored_hash is None:
            return False

        if verify_otp(code, stored_hash):
            # Delete immediately on success — one-time use
            await self._redis.delete(otp_key)
            return True

        return False

    async def send_withdrawal_confirmation(
        self,
        phone: str,
        amount: str,
        provider: str,
        reference: str,
    ) -> None:
        """Send withdrawal confirmation SMS.

        Args:
            phone: Employee's phone number.
            amount: Disbursed amount (string, e.g. "397.00").
            provider: MoMo provider name.
            reference: Transaction reference.
        """
        message = f"WageNow: GHS {amount} sent to your {provider} MoMo. Ref: {reference}"
        await self._send_sms(phone, message)
        logger.info("withdrawal_sms_sent", phone=phone[-4:], reference=reference)

    async def _send_sms(self, to: str, body: str) -> None:
        """Send an SMS via Twilio REST API.

        Uses httpx instead of twilio SDK for lighter dependency.
        """
        import httpx

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self._settings.twilio_account_sid}/Messages.json"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    auth=(
                        self._settings.twilio_account_sid,
                        self._settings.twilio_auth_token,
                    ),
                    data={
                        "From": self._settings.twilio_phone_number,
                        "To": to,
                        "Body": body,
                    },
                )
                if response.status_code not in (200, 201):
                    logger.error(
                        "twilio_sms_failed",
                        status=response.status_code,
                        body=response.text[:200],
                    )
                    raise SMSError(f"Twilio returned {response.status_code}")

        except httpx.HTTPError as e:
            logger.error("twilio_http_error", error=str(e))
            raise SMSError(f"SMS delivery failed: {e}") from e

    async def _check_otp_rate_limit(self, phone: str) -> None:
        """Rate limit: 5 OTP requests per 15 minutes per phone number."""
        import time

        key = f"otp:ratelimit:{phone}"
        now = time.time()
        pipe = self._redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - OTP_RATE_LIMIT_WINDOW)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, OTP_RATE_LIMIT_WINDOW)
        results = await pipe.execute()
        count = results[1]

        if count >= OTP_RATE_LIMIT_MAX:
            raise SMSError("OTP rate limit exceeded. Try again later.")
