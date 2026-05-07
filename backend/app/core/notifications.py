import httpx
import structlog
from app.core.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

async def send_line_notify(message: str):
    if not settings.line_notify_token:
        logger.warning("line_notify_token_missing", message=message)
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://notify-api.line.me/api/notify",
                headers={"Authorization": f"Bearer {settings.line_notify_token}"},
                data={"message": message},
                timeout=10.0
            )
            if resp.status_code == 200:
                logger.info("line_notify_sent", message=message)
                return True
            else:
                logger.error("line_notify_failed", status=resp.status_code, text=resp.text)
                return False
    except Exception as e:
        logger.error("line_notify_error", error=str(e))
        return False
