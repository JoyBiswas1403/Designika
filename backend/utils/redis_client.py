import redis
from config import settings

# Redis Client (Singleton)
try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
except Exception as e:
    print(f"❌ Redis Connection Error: {e}")
    redis_client = None

def get_cache(key: str):
    if redis_client:
        return redis_client.get(key)
    return None

def set_cache(key: str, value: str, expire: int = 3600):
    if redis_client:
        redis_client.set(key, value, ex=expire)
