from pydantic import BaseModel
from typing import TypeVar, Generic, Optional

T = TypeVar("T")


class Meta(BaseModel):
    page: Optional[int] = None
    total: Optional[int] = None
    has_next: Optional[bool] = None


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    meta: Optional[Meta] = None


def ok(data=None, meta: dict | None = None) -> ApiResponse:
    meta_obj = Meta(**meta) if meta else None
    return ApiResponse(success=True, data=data, meta=meta_obj)


def err(message: str) -> ApiResponse:
    return ApiResponse(success=False, error=message)
