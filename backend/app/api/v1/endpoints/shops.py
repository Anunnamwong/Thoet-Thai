from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from fastapi.security import HTTPAuthorizationCredentials
from app.core.deps import get_db, get_current_user, security_optional
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.shop import (
    ShopCreate,
    ShopUpdate,
    ShopListItem,
    ShopDetail,
    ShopHoursSchema,
    MerchantRevenueOut,
    ShopHoursUpdateItem,
)
from app.schemas.menu import MenuCategorySchema, MenuItemSchema
from app.schemas.common import ApiResponse, ok
from app.services import shop as shop_svc

router = APIRouter()


@router.get("", response_model=ApiResponse[list[ShopListItem]])
async def list_shops(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
):
    shops, total = await shop_svc.list_shops(db, lat, lng, category, search, page, limit)
    return ok(
        data=[ShopListItem.model_validate(s) for s in shops],
        meta={"page": page, "total": total, "has_next": (page * limit) < total},
    )


@router.get("/mine", response_model=ApiResponse[ShopDetail])
async def get_my_shop(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("merchant", "admin"):
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์เข้าถึงส่วนนี้")
    shop = await shop_svc.get_shop_by_owner(db, current_user.id)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านของคุณ")
    detail = ShopDetail.model_validate(shop)
    return ok(data=detail)


@router.get("/mine/revenue", response_model=ApiResponse[dict])
async def get_my_shop_revenue(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("merchant", "admin"):
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์เข้าถึงส่วนนี้")
    shop = await shop_svc.get_shop_by_owner(db, current_user.id)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านของคุณ")
    revenue = await shop_svc.get_merchant_revenue(db, shop.id, current_user.id)
    return ok(data=revenue)


@router.get("/mine/hours", response_model=ApiResponse[list[ShopHoursSchema]])
async def get_my_shop_hours_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("merchant", "admin"):
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์เข้าถึงส่วนนี้")
    shop, hours = await shop_svc.get_my_shop_hours(db, current_user.id)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านของคุณ")
    return ok(data=[ShopHoursSchema.model_validate(h) for h in hours])


@router.put("/mine/hours", response_model=ApiResponse[list[ShopHoursSchema]])
async def update_my_shop_hours_endpoint(
    items: list[ShopHoursUpdateItem],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("merchant", "admin"):
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์เข้าถึงส่วนนี้")
    try:
        shop, hours = await shop_svc.update_my_shop_hours(db, current_user.id, items)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านของคุณ")
    return ok(data=[ShopHoursSchema.model_validate(h) for h in hours])


@router.get("/{shop_id}", response_model=ApiResponse[ShopDetail])
async def get_shop(
    shop_id: UUID,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
):
    shop, hours = await shop_svc.get_shop_with_hours(db, shop_id)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านที่ต้องการ")

    detail = ShopDetail.model_validate(shop)
    detail.hours = [ShopHoursSchema.model_validate(h) for h in hours]
    return ok(data=detail)


@router.get("/{shop_id}/menu", response_model=ApiResponse[list[MenuCategorySchema]])
async def get_shop_menu(
    shop_id: UUID,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
):
    menu = await shop_svc.get_shop_menu(db, shop_id)
    return ok(data=[
        MenuCategorySchema(
            id=g["id"],
            shop_id=g["shop_id"],
            name=g["name"],
            sort_order=g["sort_order"],
            items=[MenuItemSchema.model_validate(i) for i in g["items"]],
        )
        for g in menu
    ])


@router.post("", response_model=ApiResponse[ShopDetail], status_code=201)
async def create_shop(
    data: ShopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("merchant", "admin"):
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์เข้าถึงส่วนนี้")
    shop = await shop_svc.create_shop(db, current_user.id, data)
    detail = ShopDetail.model_validate(shop)
    return ok(data=detail)


@router.patch("/{shop_id}", response_model=ApiResponse[ShopDetail])
async def update_shop(
    shop_id: UUID,
    data: ShopUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shop = await shop_svc.update_shop(db, shop_id, current_user, data)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านที่ต้องการ")
    return ok(data=ShopDetail.model_validate(shop))


@router.patch("/{shop_id}/toggle", response_model=ApiResponse[dict])
async def toggle_shop(
    shop_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shop = await shop_svc.toggle_shop(db, shop_id, current_user)
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านที่ต้องการ")
    return ok(data={"is_open": shop.is_open})
