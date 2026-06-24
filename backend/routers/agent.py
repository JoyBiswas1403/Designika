"""
Agent Brain API Router - Exposes AI Agent functionality.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from dependencies import get_current_user
from agents.crew import DesignCrew
from services.memory_service import memory_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Request Models
class DesignBriefRequest(BaseModel):
    prompt: str
    room_type: Optional[str] = "living room"

class MemoryAddRequest(BaseModel):
    fact: str
    metadata: Optional[dict] = None

# Endpoints
@router.post("/design-brief")
async def generate_design_brief(
    request: DesignBriefRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a design brief using the AI Agent Crew."""
    try:
        user_id = current_user.get("id", "anonymous")
        crew = DesignCrew(user_id=user_id)
        result = crew.create_design_brief(
            user_prompt=request.prompt,
            room_type=request.room_type
        )
        return result
    except Exception as e:
        logger.error(f"Agent execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/memory/add")
async def add_memory(
    request: MemoryAddRequest,
    current_user: dict = Depends(get_current_user)
):
    """Store a user preference in long-term memory."""
    user_id = current_user.get("id", "anonymous")
    result = memory_service.add_memory(
        user_id=user_id,
        fact=request.fact,
        metadata=request.metadata
    )
    if result:
        return {"success": True, "message": "Memory stored"}
    return {"success": False, "message": "Failed to store memory"}

@router.get("/memory")
async def get_memories(
    query: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve user memories, optionally filtered by semantic search."""
    user_id = current_user.get("id", "anonymous")
    memories = memory_service.get_memories(user_id=user_id, query=query)
    return {"memories": memories}
