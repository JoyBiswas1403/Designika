"""Users router - Profile management"""
from fastapi import APIRouter, Depends
from dependencies import get_current_user
from database import get_db
from models import User
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/me")
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile. Looks up full user from DB using token's sub claim."""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        return {
            "id": current_user["id"],
            "email": current_user.get("email", ""),
            "username": current_user.get("username", "user"),
            "profile_picture": None,
            "bio": None,
        }
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "profile_picture": user.profile_picture,
        "bio": user.bio,
    }
