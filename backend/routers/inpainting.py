from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.ai_service import generate_inpainting_job, get_prediction_status
import shutil
import base64
import os
import uuid

router = APIRouter()
UPLOAD_DIR = "uploads"

@router.post("")
async def start_inpainting(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form("remove object, clean background")
):
    print(f"DEBUG: Inpainting Request. Prompt: {prompt}")
    try:
        # READ FILES SAFELY
        img_bytes = await image.read()
        mask_bytes = await mask.read()
        
        # Verify sizes
        if len(img_bytes) == 0 or len(mask_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image or mask file.")

        # Extract Original Dimensions
        from PIL import Image
        import io
        
        try:
            with Image.open(io.BytesIO(img_bytes)) as pil_img:
                width, height = pil_img.size
                print(f"DEBUG: Original Image Size: {width}x{height}")
                
                # Snap to multiples of 64 (Required by Model)
                width = (width // 64) * 64
                height = (height // 64) * 64
                
                # Clamp to Max 1024 (Required by Model)
                width = min(width, 1024)
                height = min(height, 1024)
                
                # Ensure minimum 64
                width = max(width, 64)
                height = max(height, 64)
                
                print(f"DEBUG: Snapped Image Size: {width}x{height}")
                
        except Exception as img_e:
             print(f"Warning: Could not read dimensions: {img_e}")
             width, height = 512, 512 # Fallback

        image_b64 = base64.b64encode(img_bytes).decode('utf-8')
        image_uri = f"data:image/png;base64,{image_b64}" # Use PNG to be safe
        
        mask_b64 = base64.b64encode(mask_bytes).decode('utf-8')
        mask_uri = f"data:image/png;base64,{mask_b64}" # CRITICAL: Mask must be PNG to avoid JPEG artifacts
        
        prediction = await generate_inpainting_job(image_uri, mask_uri, prompt, width, height)
        
        return {
            "id": prediction.id,
            "status": prediction.status
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CRITICAL INPAINTING ERROR: {e}")
        import traceback
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"Inpainting Service Error: {str(e)}")

@router.get("/{jobId}")
async def get_inpainting_status(jobId: str):
    # Reuse valid logic from transform status or similar
    try:
        prediction = get_prediction_status(jobId)
        status = prediction.status
        
        if status == 'succeeded':
            output = prediction.output
            # Inpainting output is usually single URL
            return {
                "status": "succeeded",
                "output": output # Frontend can handle URL here?
                # Frontend code in EraserCanvas: `setSelectedImage(data.output as string)`
                # It fetches blob from URL. So returning URL is fine!
            }
        elif status == 'failed':
            return {"status": "failed"}
        else:
            return {"status": "processing"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
