from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv
from utils.vault_client import vault

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Interior Design AI"
    ENV: str = "development"
    
    # Secrets (Try Vault First, then Env)
    SECRET_KEY: str = vault.get_secret("app", "secret_key") or os.getenv("SECRET_KEY", "dev_secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Keys
    OPENAI_API_KEY: Optional[str] = vault.get_secret("ai", "openai_key") or os.getenv("OPENAI_API_KEY")
    REPLICATE_API_TOKEN: Optional[str] = vault.get_secret("ai", "replicate_token") or os.getenv("REPLICATE_API_TOKEN")
    
    # Databases (The Big 5)
    DATABASE_URL: str = vault.get_secret("db", "postgres_url") or os.getenv("DATABASE_URL", "sqlite:///./interior.db")
    MONGO_URL: str = vault.get_secret("db", "mongo_url") or os.getenv("MONGO_URL", "mongodb://localhost:27017")
    REDIS_URL: str = vault.get_secret("db", "redis_url") or os.getenv("REDIS_URL", "redis://localhost:6379")
    MILVUS_URI: str = vault.get_secret("db", "milvus_uri") or os.getenv("MILVUS_URI", "http://localhost:19530")
    NEO4J_URI: str = vault.get_secret("db", "neo4j_uri") or os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = vault.get_secret("db", "neo4j_password") or os.getenv("NEO4J_PASSWORD", "designika_graph")

    # Keycloak
    KEYCLOAK_URL: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    KEYCLOAK_REALM: str = os.getenv("KEYCLOAK_REALM", "Designika")
    KEYCLOAK_CLIENT_ID: str = os.getenv("KEYCLOAK_CLIENT_ID", "backend-api")

    # Stripe Payments
    STRIPE_SECRET_KEY: str = vault.get_secret("payments", "stripe_secret") or os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = vault.get_secret("payments", "stripe_webhook") or os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # Email (Resend)
    RESEND_API_KEY: str = vault.get_secret("email", "resend_key") or os.getenv("RESEND_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
