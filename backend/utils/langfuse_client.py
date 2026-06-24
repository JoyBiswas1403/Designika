"""
LangFuse Client for AI Observability and Tracing.
"""
from langfuse import Langfuse
from langfuse.decorators import observe
from config import settings
import os
import logging

logger = logging.getLogger(__name__)

# Initialize LangFuse (if keys are configured)
langfuse_client = None

try:
    # LangFuse requires LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY
    if os.getenv("LANGFUSE_PUBLIC_KEY") and os.getenv("LANGFUSE_SECRET_KEY"):
        langfuse_client = Langfuse()
        logger.info("✅ LangFuse Tracing Initialized")
    else:
        logger.warning("⚠️ LangFuse keys not found - Tracing disabled")
except Exception as e:
    logger.error(f"❌ LangFuse Init Failed: {e}")

def trace_agent(name: str):
    """
    Decorator to trace an agent function with LangFuse.
    
    Usage:
        @trace_agent("ResearcherAgent")
        def run_researcher(prompt):
            ...
    """
    def decorator(func):
        if langfuse_client:
            return observe(name=name)(func)
        else:
            return func  # No-op if LangFuse not configured
    return decorator

def log_generation(
    name: str,
    input_text: str,
    output_text: str,
    model: str,
    tokens_used: int = 0,
    cost: float = 0.0,
    metadata: dict = None
):
    """Log a single LLM generation to LangFuse."""
    if not langfuse_client:
        return
    
    try:
        langfuse_client.generation(
            name=name,
            input=input_text,
            output=output_text,
            model=model,
            usage={"total_tokens": tokens_used},
            metadata=metadata or {}
        )
    except Exception as e:
        logger.error(f"Failed to log to LangFuse: {e}")
