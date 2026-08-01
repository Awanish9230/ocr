import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoParse API"
    API_V1_STR: str = "/api"
    
    # Use SQLite for local development to avoid postgres setup hassle
    # SQLite URL format: sqlite:///./autoparse.db
    DATABASE_URL: str = "sqlite:///./autoparse.db"
    
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_EXPIRES_IN: str = "7d"
    JWT_REFRESH_EXPIRES_IN: str = "7d"
    
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    GEMINI_API_KEYS: str
    GROQ_API_KEYS: str
    
    @property
    def get_gemini_keys(self) -> List[str]:
        return [k.strip() for k in self.GEMINI_API_KEYS.split(",") if k.strip()]
        
    @property
    def get_groq_keys(self) -> List[str]:
        return [k.strip() for k in self.GROQ_API_KEYS.split(",") if k.strip()]

    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
