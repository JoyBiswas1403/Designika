from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Interior Design AI"
    ENV: str = "development"
    
    # Secrets
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Keys
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    REPLICATE_API_TOKEN: Optional[str] = os.getenv("REPLICATE_API_TOKEN")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interior.db")

    # Email (Resend)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
