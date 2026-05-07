from supabase import create_client, Client
from app.core.config import get_settings
import structlog

settings = get_settings()
logger = structlog.get_logger()

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_service_key:
            logger.warning("supabase_config_missing", url=bool(settings.supabase_url), key=bool(settings.supabase_service_key))
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client

def upload_file(bucket: str, path: str, file_content: bytes, content_type: str = "image/jpeg"):
    supabase = get_supabase()
    try:
        # storage.from_('bucket').upload(path, file)
        res = supabase.storage.from_(bucket).upload(
            path=path,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        # In newer supabase-py versions, res is the actual response object or raises error
        # Get public URL
        url = supabase.storage.from_(bucket).get_public_url(path)
        return url
    except Exception as e:
        logger.error("supabase_upload_error", error=str(e))
        raise e
