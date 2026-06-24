"""
Temporal Activities - The actual work units executed by the worker.
"""
from temporalio import activity
from dataclasses import dataclass
import httpx
import os
import logging

logger = logging.getLogger(__name__)

@dataclass
class ImageGenerationInput:
    design_id: str
    user_id: str
    prompt: str
    style: str
    intensity: float = 0.8


@activity.defn
async def generate_image_activity(input: ImageGenerationInput) -> dict:
    """
    Activity: Call Replicate API to generate transformed image.
    This runs on the Temporal Worker, not the web server.
    """
    logger.info(f"Generating image for design {input.design_id}")
    
    try:
        import replicate
        
        # Build the prompt
        full_prompt = f"{input.prompt}, {input.style} style, professional interior design photography, 8k, realistic"
        
        # Call Replicate (Flux model)
        output = replicate.run(
            "black-forest-labs/flux-1.1-pro",
            input={
                "prompt": full_prompt,
                "aspect_ratio": "16:9",
                "output_format": "webp",
                "output_quality": 90,
                "safety_tolerance": 2,
                "prompt_upsampling": True
            }
        )
        
        # Get the result URL
        result_url = output if isinstance(output, str) else str(output)
        
        logger.info(f"Image generated successfully: {result_url[:50]}...")
        return {
            "success": True,
            "image_url": result_url,
            "design_id": input.design_id
        }
    
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "design_id": input.design_id
        }


@activity.defn
async def update_database_activity(design_id: str, image_url: str, status: str) -> bool:
    """
    Activity: Update the database with the generated image result.
    """
    logger.info(f"Updating DB for design {design_id} with status {status}")
    
    try:
        from database import SessionLocal
        from models import Design
        
        db = SessionLocal()
        try:
            design = db.query(Design).filter(Design.id == design_id).first()
            if design:
                design.transformed_image_url = image_url
                design.status = status
                db.commit()
                logger.info(f"Design {design_id} updated successfully")
                return True
            else:
                logger.warning(f"Design {design_id} not found")
                return False
        finally:
            db.close()
    
    except Exception as e:
        logger.error(f"Database update failed: {e}")
        return False


@activity.defn
async def notify_user_activity(user_id: str, design_id: str, status: str) -> bool:
    """
    Activity: Send notification to user (placeholder for future integration).
    """
    logger.info(f"Notifying user {user_id} about design {design_id}: {status}")
    # TODO: Integrate with notification service (email, push, etc.)
    return True
