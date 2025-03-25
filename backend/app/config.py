from decouple import config
from typing import List
from functools import lru_cache
import os

class Settings:
    PROJECT_NAME: str = "Covera AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server settings
    HOST: str = config('HOST', default='0.0.0.0')
    PORT: int = config('PORT', default=8000, cast=int)
    
    # Supabase
    SUPABASE_URL: str = config('SUPABASE_URL', default='')
    SUPABASE_KEY: str = config('SUPABASE_SERVICE_KEY', default='')
    
    # Gemini
    GEMINI_API_KEY: str = config('GEMINI_API_KEY', default='')
    
    # CORS - Allow frontend domain
    BACKEND_CORS_ORIGINS: List[str] = [
        config('FRONTEND_URL', default="http://localhost:3000"),
        "https://covera-chat.vercel.app",  # Add your Vercel domain here
    ]
    
    # Environment
    ENV: str = config('ENV', default='development')
    DEBUG: bool = ENV == 'development'

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
