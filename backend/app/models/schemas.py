from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    content: str
    role: str
    user_id: str
    model_provider: str = "gemini"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True

class QuoteRequest(BaseModel):
    user_id: str
    quote_data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True

class PolicyAnalysisRequest(BaseModel):
    document_id: str
    user_id: str

    class Config:
        arbitrary_types_allowed = True

class ErrorResponse(BaseModel):
    detail: str
    error_code: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True

class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
