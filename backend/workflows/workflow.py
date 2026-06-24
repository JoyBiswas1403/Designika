"""
Temporal Workflows - Orchestration of activities for image generation.
"""
from temporalio import workflow
from datetime import timedelta
from dataclasses import dataclass

# Import activities (will be resolved at runtime)
with workflow.unsafe.imports_passed_through():
    from workflows.activities import (
        ImageGenerationInput,
        generate_image_activity,
        update_database_activity,
        notify_user_activity
    )


@dataclass
class ImageWorkflowInput:
    design_id: str
    user_id: str
    prompt: str
    style: str
    intensity: float = 0.8


@workflow.defn
class ImageGenerationWorkflow:
    """
    Workflow: Orchestrates the complete image generation pipeline.
    
    Steps:
    1. Generate image via Replicate
    2. Update database with result
    3. Notify user of completion
    """
    
    @workflow.run
    async def run(self, input: ImageWorkflowInput) -> dict:
        workflow.logger.info(f"Starting image generation workflow for {input.design_id}")
        
        # Step 1: Generate the image
        gen_input = ImageGenerationInput(
            design_id=input.design_id,
            user_id=input.user_id,
            prompt=input.prompt,
            style=input.style,
            intensity=input.intensity
        )
        
        gen_result = await workflow.execute_activity(
            generate_image_activity,
            gen_input,
            start_to_close_timeout=timedelta(minutes=5)  # Image gen can take time
        )
        
        if not gen_result.get("success"):
            # Update DB with failed status
            await workflow.execute_activity(
                update_database_activity,
                args=[input.design_id, None, "failed"],
                start_to_close_timeout=timedelta(seconds=30)
            )
            return {
                "success": False,
                "error": gen_result.get("error", "Unknown error"),
                "design_id": input.design_id
            }
        
        # Step 2: Update database with success
        image_url = gen_result.get("image_url")
        await workflow.execute_activity(
            update_database_activity,
            args=[input.design_id, image_url, "completed"],
            start_to_close_timeout=timedelta(seconds=30)
        )
        
        # Step 3: Notify user
        await workflow.execute_activity(
            notify_user_activity,
            args=[input.user_id, input.design_id, "completed"],
            start_to_close_timeout=timedelta(seconds=10)
        )
        
        workflow.logger.info(f"Workflow completed for {input.design_id}")
        return {
            "success": True,
            "image_url": image_url,
            "design_id": input.design_id
        }
