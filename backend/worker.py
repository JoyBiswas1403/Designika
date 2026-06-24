"""
Temporal Worker - Runs as a separate process to execute workflows.

Usage:
    python worker.py

This connects to the Temporal server and polls for tasks to execute.
"""
import asyncio
from temporalio.client import Client
from temporalio.worker import Worker
from workflows.workflow import ImageGenerationWorkflow
from workflows.activities import (
    generate_image_activity,
    update_database_activity,
    notify_user_activity
)
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
TEMPORAL_HOST = os.getenv("TEMPORAL_HOST", "localhost:7233")
TASK_QUEUE = "image-generation-queue"


async def main():
    """Main worker entry point."""
    logger.info(f"Connecting to Temporal at {TEMPORAL_HOST}")
    
    # Connect to Temporal server
    client = await Client.connect(TEMPORAL_HOST)
    
    logger.info(f"Starting worker on task queue: {TASK_QUEUE}")
    
    # Create and run the worker
    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[ImageGenerationWorkflow],
        activities=[
            generate_image_activity,
            update_database_activity,
            notify_user_activity
        ]
    )
    
    logger.info("✅ Temporal Worker Started. Waiting for tasks...")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
