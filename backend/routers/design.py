from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Design, User
from dependencies import get_current_user
from services.storage import save_design
import shutil
import os
import uuid
from typing import List, Optional

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[dict])
async def list_designs(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    designs = db.query(Design).filter(Design.user_id == current_user.id).offset(skip).limit(limit).all()
    # Convert to dict for response (Pydantic would handle this better if we had schemas, but simple dict return works)
    return [
        {
            "id": d.id,
            "title": d.title,
            "room_type": d.room_type,
            "style": d.style,
            "image_url": d.image_url,
            "status": d.status,
            "created_at": d.created_at
        } for d in designs
    ]

@router.get("/public", response_model=List[dict])
async def list_public_designs(
    skip: int = 0, 
    limit: int = 10, 
    style: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Design).filter(Design.status == "completed")
    if style:
        query = query.filter(Design.style == style)
    
    designs = query.offset(skip).limit(limit).all()
    return [
        {
            "id": d.id, # Consider not exposing ID optionally
            "title": d.title,
            "room_type": d.room_type,
            "style": d.style,
            "image_url": d.image_url,
            "status": d.status,
            "created_at": d.created_at
        } for d in designs
    ]

@router.get("/{design_id}")
async def get_design(
    design_id: str,
    db: Session = Depends(get_db) # Public access for now to share links? Or add auth.
):
    design = db.query(Design).filter(Design.id == design_id).first()
    if not design:
         return {
            "id": design_id,
            "title": "Not Found",
            "room_type": "Unknown",
            "style": "Unknown",
            "image_url": "", 
            "status": "failed"
        }
    return {
        "id": design.id,
        "title": design.title,
        "room_type": design.room_type,
        "style": design.style,
        "image_url": design.image_url,
        "status": design.status,
        "created_at": design.created_at
    }

@router.post("/")
async def create_design(
    file: UploadFile = File(...),
    title: str = Form(...),
    room_type: str = Form("Living Room"),
    style: str = Form("Modern Minimalist"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    design_id = str(uuid.uuid4())
    safe_filename = f"{design_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_design = Design(
        id=design_id,
        title=title,
        room_type=room_type,
        style=style,
        image_url=f"/uploads/{safe_filename}", # In prod, this would be S3
        local_path=file_path,
        status="ready",
        user_id=current_user.id
    )
    
    db.add(new_design)
    db.commit()
    db.refresh(new_design)
    
    # Legacy support if other services use 'save_design' to file
    data = {
        "id": new_design.id,
        "title": new_design.title,
        "room_type": new_design.room_type,
        "style": new_design.style,
        "local_path": new_design.local_path,
        "image_url": new_design.image_url,
        "status": new_design.status
    }
    save_design(design_id, data)
    
    return data
