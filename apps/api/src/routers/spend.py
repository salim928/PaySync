"""ClearSpend router — Phase 2 stub.

All endpoints return 501 Not Implemented.
Routes are registered so the OpenAPI schema documents the Phase 2 API contract.
"""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/spend", tags=["spend (Phase 2)"])


@router.get("/wallets")
async def list_wallets() -> dict:
    """Phase 2: List corporate spend wallets."""
    raise HTTPException(status_code=501, detail="ClearSpend launches in Phase 2")


@router.post("/wallets")
async def create_wallet() -> dict:
    """Phase 2: Create a spend wallet."""
    raise HTTPException(status_code=501, detail="ClearSpend launches in Phase 2")


@router.post("/transactions")
async def create_transaction() -> dict:
    """Phase 2: Record a spend transaction."""
    raise HTTPException(status_code=501, detail="ClearSpend launches in Phase 2")


@router.get("/policies")
async def list_policies() -> dict:
    """Phase 2: List spend policies."""
    raise HTTPException(status_code=501, detail="ClearSpend launches in Phase 2")
