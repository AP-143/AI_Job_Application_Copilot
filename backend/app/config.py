"""Application settings, loaded from environment variables / .env."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.7-flash"

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # App
    cors_origins: list[str] = ["http://localhost:3000"]
    max_upload_mb: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()
