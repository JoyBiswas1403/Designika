from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID
    email = Column(String, unique=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    profile_picture = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    designs = relationship("Design", back_populates="owner")

class Design(Base):
    __tablename__ = "designs"

    id = Column(String, primary_key=True, index=True) # UUID
    title = Column(String)
    room_type = Column(String)
    style = Column(String)
    image_url = Column(String)
    local_path = Column(String, nullable=True)
    status = Column(String, default="ready") # ready, processing, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="designs")


class Wallet(Base):
    """User's credit wallet for pay-per-generation."""
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    balance = Column(Integer, default=0)  # Credits (1 credit = 1 generation)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", backref="wallet")
    transactions = relationship("Transaction", back_populates="wallet")


class Transaction(Base):
    """Credit transaction history."""
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)  # UUID
    wallet_id = Column(String, ForeignKey("wallets.id"))
    amount = Column(Integer)  # Positive = credit, Negative = debit
    transaction_type = Column(String)  # "topup", "generation", "refund"
    description = Column(String, nullable=True)
    stripe_payment_id = Column(String, nullable=True)  # Stripe reference
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")
