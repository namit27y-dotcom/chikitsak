from functools import lru_cache
import secrets
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "CHIKITSAK API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "mysql+pymysql://chikitsak_user:chikitsak_pass@127.0.0.1:3306/chikitsak"

    # Ephemeral fallback in memory for local dev if JWT_SECRET_KEY is not set
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    UPLOAD_DIR: str = "storage/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    TESSERACT_CMD: str = ""

    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"

    @field_validator("JWT_SECRET_KEY", mode="before")
    @classmethod
    def ensure_jwt_secret(cls, value: str | None) -> str:
        if not value or value.startswith("CHANGE_ME"):
            return secrets.token_urlsafe(32)
        return value

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def cors_origin_list(self) -> List[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        return origins or ["http://localhost:3000"]

    @property
    def resolved_upload_dir(self) -> Path:
        path = Path(self.UPLOAD_DIR)
        if not path.is_absolute():
            path = Path(__file__).resolve().parents[2] / path
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
