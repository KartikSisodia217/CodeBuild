try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

from typing import Optional

class Settings(BaseSettings):
    """
    Core Configuration Settings
    This allows the team to manage environment variables for the RAG pipeline.
    """
    APP_NAME: str = "Legal.AI API Gateway"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/legalai"
    
    # CORS — Override via CORS_ORIGINS env var in production .env
    # Use explicit origins for security, e.g.: "https://your-app.vercel.app,http://localhost:5173"
    # Default allows all origins to prevent CORS-induced streaming disconnects.
    CORS_ORIGINS: str = "*"
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    
    # Models
    MODEL_PATH: str = "google/gemma-4-it"
    
    # API Keys (Loaded from .env)
    COHERE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    VLLM_BASE_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore" # Safely ignore any other arbitrary env variables

settings = Settings()
