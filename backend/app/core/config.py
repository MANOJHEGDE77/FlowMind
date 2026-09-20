import os
from pathlib import Path
from typing import List, Union
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import field_validator

# Automatically locate and load .env from root and backend directories
_root_dir = Path(__file__).resolve().parent.parent.parent.parent
_backend_dir = Path(__file__).resolve().parent.parent.parent
for env_file in [_root_dir / ".env", _backend_dir / ".env", Path.cwd() / ".env"]:
    if env_file.exists():
        load_dotenv(dotenv_path=env_file, override=False)

class Settings(BaseSettings):
    PROJECT_NAME: str = "FlowMind"
    API_V1_STR: str = "/api"
    ENV: str = os.getenv("ENV", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "flowmind-dev-secret-key-32-chars-long-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (PostgreSQL or SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./flowmind.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Optional LLM API Keys (Supports both GEMINI_API_KEY and GOOGLE_API_KEY)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # RAG Settings
    MAX_UPLOAD_SIZE_MB: int = 25
    EMBEDDING_DIMENSION: int = 384
    
    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()

def save_gemini_api_key(key: str) -> None:
    """Updates in-memory setting and persists GEMINI_API_KEY to .env files."""
    cleaned_key = key.strip()
    settings.GEMINI_API_KEY = cleaned_key
    os.environ["GEMINI_API_KEY"] = cleaned_key
    os.environ["GOOGLE_API_KEY"] = cleaned_key

    for target_env in [_root_dir / ".env", _backend_dir / ".env"]:
        try:
            lines = []
            found = False
            if target_env.exists():
                with open(target_env, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GEMINI_API_KEY="):
                            lines.append(f"GEMINI_API_KEY={cleaned_key}\n")
                            found = True
                        else:
                            lines.append(line)
            if not found:
                lines.append(f"GEMINI_API_KEY={cleaned_key}\n")
            with open(target_env, "w", encoding="utf-8") as f:
                f.writelines(lines)
        except Exception as e:
            print(f"[Config] Error saving key to {target_env}: {e}")

