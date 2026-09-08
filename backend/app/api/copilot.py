from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.copilot import ChatRequest, ChatResponse
from app.copilot.agent import CopilotAgent

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_copilot(req: ChatRequest, business_id: int = Query(1), db: Session = Depends(get_db)):
    agent = CopilotAgent(db, business_id)
    res = agent.process_query(req.message)
    return ChatResponse(**res)
