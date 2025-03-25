from decouple import config
from typing import List
from functools import lru_cache

class Settings:
    PROJECT_NAME: str = "Covera AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase
    SUPABASE_URL: str = config('SUPABASE_URL', default='')
    SUPABASE_KEY: str = config('SUPABASE_SERVICE_KEY', default='')
    
    # Gemini
    GEMINI_API_KEY: str = config('GEMINI_API_KEY', default='')
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # In production, replace with specific origins

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
