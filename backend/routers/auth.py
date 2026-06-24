"""
Auth Router - Local JWT Authentication
Supports email/password login and registration WITHOUT Keycloak.
Generates signed HS256 JWT tokens for session management.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import uuid

from database import get_db
from config import settings
from models import User
from services.wallet_service import ensure_wallet_exists

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Request Models ───
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ─── JWT Token Creation ───
def create_access_token(user_id: str, email: str, username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "preferred_username": username,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


# ─── Register ───
@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email/password."""
    # Check if email exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Create user
    user_id = str(uuid.uuid4())
    hashed = pwd_context.hash(req.password)

    user = User(
        id=user_id,
        email=req.email,
        username=req.username,
        hashed_password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create wallet with 5 free credits
    ensure_wallet_exists(user_id)

    # Generate token
    token = create_access_token(user_id, req.email, req.username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": req.email,
            "username": req.username,
        }
    }


# ─── Login ───
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email/password and return JWT."""
    user = db.query(User).filter(User.email == req.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate token
    token = create_access_token(user.id, user.email, user.username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    }


# ─── Logout ───
@router.post("/logout")
def logout():
    """Client-side logout (clear token). No server action needed for JWT."""
    return {"message": "Logged out successfully"}


# ─── Get Current User ───
@router.get("/me")
async def get_me(
    db: Session = Depends(get_db),
):
    """Get current user info. Called from the interceptor / fetchUser."""
    from fastapi import Request
    # This endpoint is handled by the /users/me route instead
    # Keeping for compatibility
    return {"error": "Use /users/me instead"}
