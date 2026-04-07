"""Webhook signature verification for inbound MoMo and WhatsApp callbacks.

ALL inbound webhooks are verified via HMAC-SHA256 before any processing.
Uses hmac.compare_digest() — never string equality.
Returns 401 before any processing if signature is invalid.
"""

import hashlib
import hmac

import structlog

from src.core.config import get_settings

logger = structlog.get_logger()


def verify_momo_webhook(payload: bytes, signature: str) -> bool:
    """Verify Hubtel MoMo webhook HMAC-SHA256 signature.

    Args:
        payload: Raw request body bytes.
        signature: The signature from the webhook header.

    Returns:
        True if signature is valid, False otherwise.
    """
    settings = get_settings()
    expected = hmac.new(
        settings.momo_webhook_secret.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()

    is_valid = hmac.compare_digest(expected, signature)

    if not is_valid:
        logger.warning(
            "webhook_signature_rejected",
            expected_prefix=expected[:8],
            received_prefix=signature[:8] if signature else "empty",
        )

    return is_valid
