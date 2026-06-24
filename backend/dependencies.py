"""
Dependencies - JWT Token Verification
Verifies HS256 signed JWT tokens from our local auth system.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Validates the JWT access token (HS256, signed with SECRET_KEY).
    Returns user dict with id, username, email from token payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        return {
            "id": user_id,
            "username": payload.get("preferred_username", "user"),
            "email": payload.get("email"),
        }

    except JWTError:
        raise credentials_exception
