"""
Temporal Client - Dispatch workflows from FastAPI.
"""
from temporalio.client import Client
from workflows.workflow import ImageGenerationWorkflow, ImageWorkflowInput
import os
import logging
import uuid

logger = logging.getLogger(__name__)

# Configuration
TEMPORAL_HOST = os.getenv("TEMPORAL_HOST", "localhost:7233")
TASK_QUEUE = "image-generation-queue"

# Global client (initialized on first use)
_client = None


async def get_temporal_client() -> Client:
    """Get or create the Temporal client."""
    global _client
    if _client is None:
        try:
            _client = await Client.connect(TEMPORAL_HOST)
            logger.info(f"✅ Connected to Temporal at {TEMPORAL_HOST}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Temporal: {e}")
            raise
    return _client


async def dispatch_image_generation(
    design_id: str,
    user_id: str,
    prompt: str,
    style: str,
    intensity: float = 0.8
) -> str:
    """
    Dispatch an image generation workflow to Temporal.
    
    Returns:
        workflow_id: The unique identifier for tracking the workflow
    """
    client = await get_temporal_client()
    
    # Generate a unique workflow ID
    workflow_id = f"image-gen-{design_id}-{uuid.uuid4().hex[:8]}"
    
    # Start the workflow
    handle = await client.start_workflow(
        ImageGenerationWorkflow.run,
        ImageWorkflowInput(
            design_id=design_id,
            user_id=user_id,
            prompt=prompt,
            style=style,
            intensity=intensity
        ),
        id=workflow_id,
        task_queue=TASK_QUEUE
    )
    
    logger.info(f"Dispatched workflow {workflow_id} for design {design_id}")
    return workflow_id


async def get_workflow_status(workflow_id: str) -> dict:
    """Get the status of a running workflow."""
    client = await get_temporal_client()
    
    try:
        handle = client.get_workflow_handle(workflow_id)
        description = await handle.describe()
        
        return {
            "workflow_id": workflow_id,
            "status": str(description.status),
            "start_time": description.start_time.isoformat() if description.start_time else None,
            "close_time": description.close_time.isoformat() if description.close_time else None
        }
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        return {
            "workflow_id": workflow_id,
            "status": "unknown",
            "error": str(e)
        }


async def get_workflow_result(workflow_id: str) -> dict:
    """Get the result of a completed workflow."""
    client = await get_temporal_client()
    
    try:
        handle = client.get_workflow_handle(workflow_id)
        result = await handle.result()
        return result
    except Exception as e:
        logger.error(f"Failed to get workflow result: {e}")
        return {
            "success": False,
            "error": str(e)
        }
