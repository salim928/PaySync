"""Hubtel MoMo API client for MTN, Vodafone, and AirtelTigo disbursements.

Implements exponential backoff retry (3 attempts, 2s/4s/8s) for 5xx responses.
Uses idempotency keys via X-Reference-Id header.
Timeout: connect=5s, read=30s, write=10s.
"""

import base64
from decimal import Decimal

import httpx
import structlog

from src.core.config import get_settings

logger = structlog.get_logger()


class MoMoError(Exception):
    """Raised when a MoMo disbursement fails."""

    def __init__(self, message: str, response_code: str | None = None) -> None:
        self.message = message
        self.response_code = response_code
        super().__init__(message)


class HubtelMoMoClient:
    """Client for Hubtel's MoMo payment API."""

    SEND_ENDPOINT = "/v2/pos/onlinecheckout/request/send"
    MAX_RETRIES = 3
    RETRY_DELAYS = [2, 4, 8]  # seconds

    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.hubtel_base_url
        self._callback_url = settings.momo_callback_url

        # Basic auth header
        credentials = f"{settings.hubtel_client_id}:{settings.hubtel_client_secret}"
        b64 = base64.b64encode(credentials.encode()).decode()
        self._auth_header = f"Basic {b64}"

        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=5.0, read=30.0, write=10.0),
        )

    async def disburse(
        self,
        *,
        phone: str,
        amount: Decimal,
        description: str,
        idempotency_key: str,
        client_reference: str,
    ) -> dict:
        """Send money to a MoMo wallet.

        Args:
            phone: Recipient phone in format 233XXXXXXXXX.
            amount: Amount in GHS (already minus fee).
            description: Transaction description.
            idempotency_key: Unique key for retry safety.
            client_reference: Our transaction reference.

        Returns:
            Hubtel API response as dict.

        Raises:
            MoMoError: If disbursement fails after all retries.
        """
        url = f"{self._base_url}{self.SEND_ENDPOINT}"
        headers = {
            "Authorization": self._auth_header,
            "Content-Type": "application/json",
            "X-Reference-Id": idempotency_key,
            "Cache-Control": "no-cache",
        }
        payload = {
            "CustomerMsisdn": phone,
            "Amount": float(amount),
            "Description": description,
            "PrimaryCallbackUrl": self._callback_url,
            "ClientReference": client_reference,
        }

        last_error: Exception | None = None

        for attempt in range(self.MAX_RETRIES):
            try:
                response = await self._client.post(url, headers=headers, json=payload)

                if response.status_code >= 500:
                    logger.warning(
                        "hubtel_5xx_retry",
                        attempt=attempt + 1,
                        status=response.status_code,
                        body=response.text[:200],
                    )
                    if attempt < self.MAX_RETRIES - 1:
                        import asyncio
                        await asyncio.sleep(self.RETRY_DELAYS[attempt])
                        continue
                    raise MoMoError(
                        f"Hubtel returned {response.status_code} after {self.MAX_RETRIES} attempts",
                        response_code=str(response.status_code),
                    )

                data = response.json()
                response_code = data.get("ResponseCode", "")

                if response_code == "0000":
                    logger.info(
                        "momo_disbursement_success",
                        reference=client_reference,
                        hubtel_txn=data.get("TransactionId"),
                    )
                    return data

                raise MoMoError(
                    f"MoMo disbursement failed: {data.get('Message', 'Unknown error')}",
                    response_code=response_code,
                )

            except httpx.TimeoutException as e:
                last_error = e
                logger.warning(
                    "hubtel_timeout_retry",
                    attempt=attempt + 1,
                    error=str(e),
                )
                if attempt < self.MAX_RETRIES - 1:
                    import asyncio
                    await asyncio.sleep(self.RETRY_DELAYS[attempt])
                    continue

            except httpx.HTTPError as e:
                last_error = e
                logger.error("hubtel_http_error", error=str(e))
                raise MoMoError(f"HTTP error: {e}") from e

        raise MoMoError(f"All {self.MAX_RETRIES} attempts failed: {last_error}")

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()
