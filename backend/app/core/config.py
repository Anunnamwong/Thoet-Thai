from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "[APP_NAME]"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fooddelivery"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_refresh_secret: str = "change-me-refresh-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 30
    jwt_refresh_expire_days: int = 7

    # LINE
    line_channel_id: str = ""
    line_channel_secret: str = ""
    line_channel_access_token: str = ""
    line_notify_token: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # PromptPay
    promptpay_id: str = ""  # เบอร์โทร or เลขบัตร

    # Sentry
    sentry_dsn: str = ""

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://liff.line.me",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
