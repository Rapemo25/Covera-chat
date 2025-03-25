from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import supabase
from datetime import datetime
import uuid
import structlog

from app.config import settings
from app.models.schemas import (
    ChatMessage,
    QuoteRequest,
    PolicyAnalysisRequest,
    ErrorResponse,
    SuccessResponse
)
from app.api.errors import CoveraError, DatabaseError, AIModelError, ValidationError, NotFoundError
from app.utils.gemini_client import gemini_client

logger = structlog.get_logger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client setup
if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
    raise ValueError("Missing Supabase environment variables")

supabase_client = supabase.create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Error handler
@app.exception_handler(CoveraError)
async def covera_error_handler(request: Request, exc: CoveraError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=str(exc.detail),
            error_code=exc.error_code
        ).model_dump()
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return SuccessResponse(message="ok").model_dump()

# Chat message endpoints
@app.post("/api/chat/messages")
async def create_message(message: ChatMessage):
    try:
        # Get AI response using Gemini
        ai_response = await gemini_client.generate_response(message.content)
        
        # Save user message
        user_message = message.model_dump()
        user_message["timestamp"] = datetime.utcnow()
        
        # Save AI response
        ai_message = {
            "content": ai_response,
            "role": "assistant",
            "user_id": message.user_id,
            "model_provider": "gemini",
            "timestamp": datetime.utcnow()
        }
        
        # Insert both messages to database
        result = supabase_client.table("chat_messages").insert([user_message, ai_message]).execute()
        
        return SuccessResponse(
            message="Messages created successfully",
            data={"messages": result.data}
        ).model_dump()
        
    except Exception as e:
        logger.error("Failed to create chat message", error=str(e))
        raise DatabaseError("Failed to save chat messages")

@app.get("/api/chat/messages/{user_id}")
async def get_chat_history(user_id: str):
    try:
        result = supabase_client.table("chat_messages")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("timestamp")\
            .execute()
            
        return SuccessResponse(
            message="Chat history retrieved",
            data={"messages": result.data}
        ).model_dump()
        
    except Exception as e:
        logger.error("Failed to get chat history", error=str(e))
        raise DatabaseError("Failed to retrieve chat history")

# Document processing endpoints
@app.post("/api/documents/upload")
async def upload_document(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    extracted_text: str = Form(None)
):
    try:
        document_id = str(uuid.uuid4())
        
        # Save document metadata
        document_data = {
            "id": document_id,
            "user_id": user_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "extracted_text": extracted_text,
            "upload_timestamp": datetime.utcnow()
        }
        
        result = supabase_client.table("documents").insert(document_data).execute()
        
        return SuccessResponse(
            message="Document uploaded successfully",
            data={"document": result.data[0]}
        ).model_dump()
        
    except Exception as e:
        logger.error("Failed to upload document", error=str(e))
        raise DatabaseError("Failed to save document")

# Insurance quote endpoints
@app.post("/api/quotes")
async def save_quote_request(quote_request: QuoteRequest):
    try:
        result = supabase_client.table("quote_requests").insert(quote_request.model_dump()).execute()
        
        return SuccessResponse(
            message="Quote request saved successfully",
            data={"quote": result.data[0]}
        ).model_dump()
        
    except Exception as e:
        logger.error("Failed to save quote request", error=str(e))
        raise DatabaseError("Failed to save quote request")

# Advanced AI processing endpoints
@app.post("/api/analysis/policy")
async def analyze_policy(request: PolicyAnalysisRequest):
    try:
        # Get document
        document = supabase_client.table("documents")\
            .select("*")\
            .eq("id", request.document_id)\
            .execute()
            
        if not document.data:
            raise NotFoundError("Document")
            
        # Analyze policy using Gemini
        analysis = await gemini_client.analyze_insurance_policy(document.data[0]["extracted_text"])
        
        # Save analysis
        analysis_data = {
            "document_id": request.document_id,
            "user_id": request.user_id,
            "analysis": analysis,
            "timestamp": datetime.utcnow()
        }
        
        result = supabase_client.table("policy_analyses").insert(analysis_data).execute()
        
        return SuccessResponse(
            message="Policy analysis completed",
            data={"analysis": result.data[0]}
        ).model_dump()
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to analyze policy", error=str(e))
        raise AIModelError("Failed to analyze policy")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
