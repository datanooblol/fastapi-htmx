from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SecondBrain"
    DATABASE_PATH: str = "data/secondbrain.duckdb"
    UPLOAD_DIR: str = "static/uploads"
    AI_COMMAND: str = "claude"
    DEFAULT_USER_ID: str = "default"

    BASE_DIR: Path = Path(__file__).resolve().parent.parent

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
