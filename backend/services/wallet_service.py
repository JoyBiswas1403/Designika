"""
Wallet Service - Manages user wallets with free credits on registration.
"""
from database import SessionLocal
from models import Wallet, Transaction
from services.stripe_service import FREE_CREDITS_FOR_NEW_USERS
import uuid
import logging

logger = logging.getLogger(__name__)


def ensure_wallet_exists(user_id: str) -> dict:
    """
    Ensure a wallet exists for the user. 
    Creates one with FREE credits if it doesn't exist.
    Call this on every authenticated request or on user creation.
    """
    db = SessionLocal()
    try:
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        
        if not wallet:
            # Create new wallet with FREE credits!
            wallet = Wallet(
                id=str(uuid.uuid4()),
                user_id=user_id,
                balance=FREE_CREDITS_FOR_NEW_USERS
            )
            db.add(wallet)
            
            # Record the free credits transaction
            transaction = Transaction(
                id=str(uuid.uuid4()),
                wallet_id=wallet.id,
                amount=FREE_CREDITS_FOR_NEW_USERS,
                transaction_type="bonus",
                description=f"Welcome bonus: {FREE_CREDITS_FOR_NEW_USERS} free credits!"
            )
            db.add(transaction)
            db.commit()
            
            logger.info(f"Created wallet for user {user_id} with {FREE_CREDITS_FOR_NEW_USERS} free credits!")
            return {
                "wallet_id": wallet.id,
                "balance": wallet.balance,
                "is_new": True,
                "free_credits": FREE_CREDITS_FOR_NEW_USERS
            }
        
        return {
            "wallet_id": wallet.id,
            "balance": wallet.balance,
            "is_new": False
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to ensure wallet: {e}")
        raise
    finally:
        db.close()
