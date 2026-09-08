import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI Cash-Flow Copilot"
    APP_ENV: str = "development"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cashflow_copilot.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "copilot-secret-key-2026")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
