"""
Rate Limiting Middleware - Protects API endpoints from abuse.
Uses SlowAPI with Redis backend for distributed rate limiting.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter with local memory storage
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
logger.info("✅ Rate Limiter initialized with in-memory storage")


# Rate limit configurations by endpoint type
RATE_LIMITS = {
    "generate": "10/minute",      # Image generation - expensive
    "chat": "30/minute",          # Chat messages
    "auth": "20/minute",          # Login/register attempts
    "payments": "10/minute",      # Payment operations
    "default": "100/minute"       # General API calls
}


def get_user_identifier(request: Request) -> str:
    """
    Get rate limit key - prefer user ID if authenticated, else IP.
    This ensures rate limits apply per-user, not per-IP for logged in users.
    """
    # Try to get user from request state (set by auth middleware)
    user = getattr(request.state, "user", None)
    if user and user.get("id"):
        return f"user:{user['id']}"
    
    # Fall back to IP address
    return get_remote_address(request)


# Decorator shortcuts for common rate limits
def rate_limit_generate(func):
    """Rate limit for image generation endpoints."""
    return limiter.limit(RATE_LIMITS["generate"], key_func=get_user_identifier)(func)

def rate_limit_chat(func):
    """Rate limit for chat endpoints."""
    return limiter.limit(RATE_LIMITS["chat"], key_func=get_user_identifier)(func)

def rate_limit_auth(func):
    """Rate limit for auth endpoints."""
    return limiter.limit(RATE_LIMITS["auth"])(func)

def rate_limit_payments(func):
    """Rate limit for payment endpoints."""
    return limiter.limit(RATE_LIMITS["payments"], key_func=get_user_identifier)(func)
