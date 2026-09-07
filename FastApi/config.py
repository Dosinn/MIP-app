from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/university_db"
    MODEL_NAME: str = "kinit/slovakbert-sts-stsb"
    SIMILARITY_K: float = 5.0
    SIMILARITY_THRESHOLD: float = 0.48
    TITLE_WEIGHT: float = 0.3
    DESC_WEIGHT: float = 0.7

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore"
    )

Config = Settings()