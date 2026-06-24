from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services.ai_service import generate_design, get_prediction_status
from services.storage import get_design
import base64
import asyncio

router = APIRouter()

class TransformRequest(BaseModel):
    design_id: str
    style: str
    lighting: str
    intensity: float = 0.75
    room_type: str = "Living Room"
    time_of_day: str = "enrich"

@router.post("/transform")
async def queue_transform(req: TransformRequest):
    design = get_design(req.design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
        
    # Read file and convert to base64 data URI for Replicate
    # (Replicate Python SDK handles path? No, 'image' needs file handle or url. 
    # If path string, it might treat as URL. 
    # Safest is to open file.)
    
    file_path = design["local_path"]
    if not file_path:
        raise HTTPException(status_code=400, detail="File path invalid")
        
    try:
        # We need to pass an open file object or a URL. 
        # Replicate SDK accepts file-like object or URL.
        # But 'generate_design' signature expected 'image_url'.
        # Let's read file content and pass as Data URI.
        with open(file_path, "rb") as f:
            image_data = f.read()
            base64_img = base64.b64encode(image_data).decode('utf-8')
            data_uri = f"data:image/jpeg;base64,{base64_img}"
            
        prediction = await generate_design(
            image_url=data_uri,
            prompt="", # Prompt embedded in service
            style=req.style,
            room_type=req.room_type,
            ai_strength=req.intensity,
            lighting_option=req.lighting
        )
        
        return {
            "job_id": prediction.id,
            "status": prediction.status,
            "estimated_seconds": 15
        }
            
    except Exception as e:
        print(f"Transformation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{jobId}")
async def get_status(jobId: str):
    try:
        prediction = get_prediction_status(jobId)
        
        status = prediction.status
        # Map Replicate status to Frontend expectations
        # Frontend expects: 'completed', 'processing', 'failed'
        # Replicate: 'starting', 'processing', 'succeeded', 'failed', 'canceled'
        
        response_status = status
        if status == 'succeeded':
            response_status = 'completed'
        elif status in ['starting', 'processing']:
            response_status = 'processing'
            
        response = {
            "id": prediction.id,
            "status": response_status,
            "progress": 100 if status == 'succeeded' else 50
        }
        
        if status == 'succeeded':
            # Get output (list of URLs usually, or one URL)
            output = prediction.output
            print(f"DEBUG: Transform Output: {output}")
            # Frontend expects base64 or URL. 
            # In Node backend, we downloaded and converted to B64.
            # Here, let's return the URL directly and see if Frontend handles it.
            # Frontend usage: `setGeneratedImage(\`data:image/jpeg;base64,\${result.images[0].image_b64}\`)`
            # Ah, Frontend EXPECTS base64. I MUST convert it.
            # Or I change Frontend. 
            # "Parity with Node backend": Node backend returned B64. 
            # I must download and convert.
            
            import httpx
            
            # Prediction output is list of URLs or single URL
            img_url = output[-1] if isinstance(output, list) else output
            
            async with httpx.AsyncClient() as client:
                r = await client.get(img_url)
                img_b64 = base64.b64encode(r.content).decode('utf-8')
                
            response["result"] = {
                "images": [{
                    "image_b64": img_b64
                }]
            }
            
        elif status == 'failed':
             response["error"] = "Replicate task failed"
             
        return response
        
    except Exception as e:
        print(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
