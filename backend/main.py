from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import os

from routers import transform, chat, inpainting, design, auth, users, agent, assistant
from middleware.rate_limiter import limiter

# Load environment variables
load_dotenv()

app = FastAPI(title="Interior Design AI API", version="2.3.0")

# Auto-create DB tables on startup
@app.on_event("startup")
def startup():
    from database import engine, Base
    import models  # noqa: F401 - ensures all models are registered
    Base.metadata.create_all(bind=engine)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
origins = ["*"] # Adjust in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(design.router, prefix="/api/v1/designs", tags=["Designs"])
app.include_router(transform.router, prefix="/api/v1/transform", tags=["Transform"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(inpainting.router, prefix="/api/v1/inpainting", tags=["Inpainting"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"]) 
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent Brain"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["AI Assistant"])

@app.get("/")
async def root():
    return {"message": "Interior Design AI API (Python/FastAPI) is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
