from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class ToolTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"

class ChatResponse(BaseModel):
    response: str
    tools_used: List[ToolTrace] = []
    disclaimer: str = "This response is calculated from actual transaction data and ML models. It provides financial insights, not professional accounting or legal advice."
