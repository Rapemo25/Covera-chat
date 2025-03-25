from fastapi import HTTPException
from typing import Optional

class CoveraError(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class DatabaseError(CoveraError):
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(status_code=500, detail=detail, error_code="DB_ERROR")

class AIModelError(CoveraError):
    def __init__(self, detail: str = "AI model processing failed"):
        super().__init__(status_code=500, detail=detail, error_code="AI_ERROR")

class ValidationError(CoveraError):
    def __init__(self, detail: str = "Invalid input data"):
        super().__init__(status_code=400, detail=detail, error_code="VALIDATION_ERROR")

class NotFoundError(CoveraError):
    def __init__(self, resource: str, detail: Optional[str] = None):
        super().__init__(
            status_code=404,
            detail=detail or f"{resource} not found",
            error_code="NOT_FOUND"
        )
