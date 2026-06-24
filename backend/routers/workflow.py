"""
Workflow API Router - Exposes Temporal workflow functionality.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from dependencies import get_current_user
from utils.temporal_client import (
    dispatch_image_generation,
    get_workflow_status,
    get_workflow_result
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# Request Models
class DispatchWorkflowRequest(BaseModel):
    design_id: str
    prompt: str
    style: str
    intensity: Optional[float] = 0.8


# Endpoints
@router.post("/dispatch")
async def dispatch_workflow(
    request: DispatchWorkflowRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Dispatch an image generation workflow to Temporal.
    Returns immediately with a workflow_id for tracking.
    """
    try:
        user_id = current_user.get("id", "anonymous")
        
        workflow_id = await dispatch_image_generation(
            design_id=request.design_id,
            user_id=user_id,
            prompt=request.prompt,
            style=request.style,
            intensity=request.intensity
        )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "message": "Workflow dispatched. Track status using /workflows/status/{workflow_id}"
        }
    
    except Exception as e:
        logger.error(f"Failed to dispatch workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{workflow_id}")
async def workflow_status(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the status of a running workflow."""
    try:
        status = await get_workflow_status(workflow_id)
        return status
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{workflow_id}")
async def workflow_result(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the result of a completed workflow."""
    try:
        result = await get_workflow_result(workflow_id)
        return result
    except Exception as e:
        logger.error(f"Failed to get workflow result: {e}")
        raise HTTPException(status_code=500, detail=str(e))
