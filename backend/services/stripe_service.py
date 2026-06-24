"""
Stripe Payment Service - Handles checkout, webhooks, and wallet operations.
"""
import stripe
from config import settings
from database import SessionLocal
from models import Wallet, Transaction, User
import uuid
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Credit Pricing (INR)
CREDIT_PACKAGES = {
    "starter": {"credits": 10, "price": 9900, "name": "Starter Pack"},       # ₹99
    "pro": {"credits": 50, "price": 39900, "name": "Pro Pack"},             # ₹399
    "enterprise": {"credits": 200, "price": 99900, "name": "Enterprise Pack"} # ₹999
}

# Free credits for new users
FREE_CREDITS_FOR_NEW_USERS = 5


class StripeService:
    @staticmethod
    def create_checkout_session(user_id: str, package_id: str, success_url: str, cancel_url: str) -> dict:
        """Create a Stripe Checkout session for credit purchase."""
        package = CREDIT_PACKAGES.get(package_id)
        if not package:
            raise ValueError(f"Invalid package: {package_id}")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": package["name"],
                            "description": f"{package['credits']} design generation credits"
                        },
                        "unit_amount": package["price"]
                    },
                    "quantity": 1
                }],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": user_id,
                    "package_id": package_id,
                    "credits": package["credits"]
                }
            )
            
            logger.info(f"Created checkout session {session.id} for user {user_id}")
            return {
                "session_id": session.id,
                "url": session.url
            }
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            raise

    @staticmethod
    def handle_webhook(payload: bytes, signature: str) -> dict:
        """Process Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid webhook signature")
            raise ValueError("Invalid signature")
        
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            return StripeService._handle_successful_payment(session)
        
        return {"status": "ignored", "event_type": event["type"]}

    @staticmethod
    def _handle_successful_payment(session: dict) -> dict:
        """Process successful payment and credit user's wallet."""
        user_id = session["metadata"]["user_id"]
        credits = int(session["metadata"]["credits"])
        payment_id = session["payment_intent"]
        
        db = SessionLocal()
        try:
            # Get or create wallet
            wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
            if not wallet:
                wallet = Wallet(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    balance=FREE_CREDITS_FOR_NEW_USERS  # Start with free credits!
                )
                db.add(wallet)
                db.flush()
            
            # Add credits
            wallet.balance += credits
            
            # Record transaction
            transaction = Transaction(
                id=str(uuid.uuid4()),
                wallet_id=wallet.id,
                amount=credits,
                transaction_type="topup",
                description=f"Purchased {credits} credits",
                stripe_payment_id=payment_id
            )
            db.add(transaction)
            db.commit()
            
            logger.info(f"Added {credits} credits to user {user_id}. New balance: {wallet.balance}")
            return {
                "status": "success",
                "user_id": user_id,
                "credits_added": credits,
                "new_balance": wallet.balance
            }
        
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to process payment: {e}")
            raise
        finally:
            db.close()


class WalletService:
    @staticmethod
    def get_balance(user_id: str) -> int:
        """Get user's credit balance."""
        db = SessionLocal()
        try:
            wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
            return wallet.balance if wallet else 0
        finally:
            db.close()
    
    @staticmethod
    def deduct_credits(user_id: str, amount: int, description: str = "Generation") -> bool:
        """Deduct credits for a generation."""
        db = SessionLocal()
        try:
            wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
            if not wallet or wallet.balance < amount:
                return False
            
            wallet.balance -= amount
            
            transaction = Transaction(
                id=str(uuid.uuid4()),
                wallet_id=wallet.id,
                amount=-amount,
                transaction_type="generation",
                description=description
            )
            db.add(transaction)
            db.commit()
            
            logger.info(f"Deducted {amount} credits from user {user_id}. New balance: {wallet.balance}")
            return True
        
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to deduct credits: {e}")
            return False
        finally:
            db.close()
    
    @staticmethod
    def get_transactions(user_id: str, limit: int = 20) -> list:
        """Get user's transaction history."""
        db = SessionLocal()
        try:
            wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
            if not wallet:
                return []
            
            transactions = db.query(Transaction)\
                .filter(Transaction.wallet_id == wallet.id)\
                .order_by(Transaction.created_at.desc())\
                .limit(limit)\
                .all()
            
            return [
                {
                    "id": t.id,
                    "amount": t.amount,
                    "type": t.transaction_type,
                    "description": t.description,
                    "created_at": t.created_at.isoformat()
                }
                for t in transactions
            ]
        finally:
            db.close()
