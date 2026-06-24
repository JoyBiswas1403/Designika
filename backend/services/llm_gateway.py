"""
LiteLLM Model Gateway - Abstracts LLM calls for easy model switching.
"""
import litellm
from config import settings
import logging

logger = logging.getLogger(__name__)

# Configure LiteLLM
litellm.set_verbose = False

def chat_completion(
    messages: list,
    model: str = "openai/gpt-4o",
    temperature: float = 0.7,
    max_tokens: int = 2048,
    fallback_models: list = None
) -> dict:
    """
    Send a chat completion request via LiteLLM.
    
    Args:
        messages: List of message dicts (role, content)
        model: Model identifier (e.g., "openai/gpt-4o", "anthropic/claude-3-sonnet")
        temperature: Creativity setting
        max_tokens: Max response length
        fallback_models: List of backup models if primary fails
    
    Returns:
        Response dict with 'content' and 'usage' keys
    """
    fallback_models = fallback_models or ["openai/gpt-4o-mini", "anthropic/claude-3-haiku"]
    
    try:
        response = litellm.completion(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.OPENAI_API_KEY  # LiteLLM uses this for OpenAI models
        )
        
        return {
            "success": True,
            "content": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            "model_used": model
        }
    
    except Exception as e:
        logger.warning(f"Primary model {model} failed: {e}. Trying fallbacks...")
        
        # Try fallback models
        for fallback in fallback_models:
            try:
                response = litellm.completion(
                    model=fallback,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    api_key=settings.OPENAI_API_KEY
                )
                
                return {
                    "success": True,
                    "content": response.choices[0].message.content,
                    "usage": response.usage.dict() if hasattr(response.usage, 'dict') else {},
                    "model_used": fallback,
                    "fallback_reason": str(e)
                }
            except Exception as fallback_error:
                logger.warning(f"Fallback {fallback} also failed: {fallback_error}")
                continue
        
        # All models failed
        logger.error(f"All models failed for request")
        return {
            "success": False,
            "error": str(e),
            "content": None
        }
