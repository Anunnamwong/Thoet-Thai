import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.deps import get_current_user
from app.models.user import User
from app.core.supabase import upload_file
from app.schemas.common import ApiResponse, ok
import structlog

router = APIRouter()
logger = structlog.get_logger()

@router.post("/upload", response_model=ApiResponse[dict])
async def upload_image(
    file: UploadFile = File(...),
    bucket: str = "uploads",
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image to Supabase Storage.
    Path will be: {bucket}/{user_id}/{filename_with_uuid}
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, detail="ไฟล์ที่อัปโหลดต้องเป็นรูปภาพเท่านั้น")
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024: # 5MB limit
        raise HTTPException(400, detail="ขนาดไฟล์ห้ามเกิน 5MB")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{ext}"
    path = f"{current_user.id}/{unique_filename}"
    
    try:
        public_url = upload_file(bucket, path, content, file.content_type)
        return ok(data={"url": public_url, "filename": unique_filename})
    except Exception as e:
        logger.error("upload_endpoint_error", error=str(e))
        raise HTTPException(500, detail="ไม่สามารถอัปโหลดรูปภาพได้ในขณะนี้")
