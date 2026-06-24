from fastapi import APIRouter, HTTPException, Body
from services.ai_service import chat_with_openai

router = APIRouter()

@router.post("/")
async def chat(
    message: str = Body(..., embed=True),
    history: list = Body([], embed=True),
    context: dict = Body({}, embed=True)
):
    try:
        reply = await chat_with_openai(message, history, context)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Adding Auth Login Mock here or explicitly in main?
# Frontend calls `api.post('/auth/login', ...)`
# I need to handle that path somewhere. 
# `main.py` included chat router at `/api/chat`.
# I should make a tiny auth router. But let's verify if `chat.py` is the right place.
# No.
