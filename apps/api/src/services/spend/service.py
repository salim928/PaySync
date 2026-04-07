"""Phase 2 spend service stubs.

These classes exist so the module structure is ready for Phase 2.
All methods raise NotImplementedError. No Phase 2 logic is built in Phase 1.
"""


class SpendWalletService:
    """Manages corporate spend wallets. Phase 2."""

    async def create_wallet(self, **kwargs) -> None:
        raise NotImplementedError("ClearSpend launches in Phase 2")

    async def get_balance(self, wallet_id) -> None:
        raise NotImplementedError("ClearSpend launches in Phase 2")

    async def fund_wallet(self, wallet_id, amount) -> None:
        raise NotImplementedError("ClearSpend launches in Phase 2")


class SpendPolicyEngine:
    """Evaluates spend policies. Phase 2."""

    async def evaluate(self, transaction, policy) -> None:
        raise NotImplementedError("ClearSpend launches in Phase 2")


class ReceiptProcessor:
    """WhatsApp receipt bot + AI classification. Phase 2."""

    async def process_receipt(self, image_url) -> None:
        raise NotImplementedError("ClearSpend launches in Phase 2")
