"""
Payments API Router - Stripe checkout, webhooks, and wallet operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from dependencies import get_current_user
from services.stripe_service import StripeService, WalletService, CREDIT_PACKAGES, FREE_CREDITS_FOR_NEW_USERS
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# Request Models
class CheckoutRequest(BaseModel):
    package_id: str  # "starter", "pro", "enterprise"
    success_url: str
    cancel_url: str


# Endpoints
@router.get("/packages")
async def get_credit_packages():
    """Get available credit packages."""
    return {
        "currency": "INR",
        "free_credits_for_new_users": FREE_CREDITS_FOR_NEW_USERS,
        "packages": [
            {
                "id": key,
                "name": pkg["name"],
                "credits": pkg["credits"],
                "price": pkg["price"] / 100,  # Convert paise to rupees
                "currency": "INR"
            }
            for key, pkg in CREDIT_PACKAGES.items()
        ]
    }


@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for credit purchase."""
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        result = StripeService.create_checkout_session(
            user_id=user_id,
            package_id=request.package_id,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """Stripe webhook endpoint for payment events."""
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    try:
        payload = await request.body()
        result = StripeService.handle_webhook(payload, stripe_signature)
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


@router.get("/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    """Get current user's credit balance."""
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    balance = WalletService.get_balance(user_id)
    return {"balance": balance}


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's transaction history."""
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    transactions = WalletService.get_transactions(user_id, limit)
    return {"transactions": transactions}
