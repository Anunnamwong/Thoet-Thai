import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.models.menu import MenuItem, MenuCategory
from app.models.shop import Shop
from app.schemas.menu import (
    MenuCategoryCreate,
    MenuCategorySchema,
    MenuCategoryUpdate,
    MenuItemCreate,
    MenuItemSchema,
    MenuItemUpdate,
)
from app.schemas.common import ApiResponse, ok

router = APIRouter()


async def _assert_owns_shop(db: AsyncSession, shop_id: uuid.UUID, user: User) -> Shop:
    result = await db.execute(
        select(Shop).where(Shop.id == shop_id, Shop.deleted_at.is_(None))
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(404, detail="ไม่พบร้านค้า")
    if user.role != "admin" and shop.owner_id != user.id:
        raise HTTPException(403, detail="คุณไม่มีสิทธิ์จัดการร้านนี้")
    return shop


async def _assert_category_in_shop(
    db: AsyncSession,
    category_id: uuid.UUID | None,
    shop_id: uuid.UUID,
) -> None:
    if category_id is None:
        return

    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.shop_id == shop_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(400, detail="ไม่พบหมวดหมู่ในร้านนี้")


@router.post("", response_model=ApiResponse[MenuItemSchema], status_code=201)
async def create_menu_item(
    data: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    await _assert_owns_shop(db, data.shop_id, current_user)
    await _assert_category_in_shop(db, data.category_id, data.shop_id)
    item = MenuItem(
        shop_id=data.shop_id,
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        options=data.options or [],
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)

    # Broadcast menu update to all users
    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(item.shop_id),
        "item_id": str(item.id)
    })

    return ok(data=MenuItemSchema.model_validate(item))


@router.patch("/{item_id}", response_model=ApiResponse[MenuItemSchema])
async def update_menu_item(
    item_id: uuid.UUID,
    data: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    result = await db.execute(
        select(MenuItem).where(MenuItem.id == item_id, MenuItem.deleted_at.is_(None))
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, detail="ไม่พบเมนู")
    await _assert_owns_shop(db, item.shop_id, current_user)
    if "category_id" in data.model_fields_set:
        await _assert_category_in_shop(db, data.category_id, item.shop_id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.flush()
    await db.refresh(item)

    # Broadcast update
    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(item.shop_id),
        "item_id": str(item.id)
    })

    return ok(data=MenuItemSchema.model_validate(item))


@router.delete("/{item_id}", response_model=ApiResponse[dict])
async def delete_menu_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    result = await db.execute(
        select(MenuItem).where(MenuItem.id == item_id, MenuItem.deleted_at.is_(None))
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, detail="ไม่พบเมนู")
    await _assert_owns_shop(db, item.shop_id, current_user)
    item.deleted_at = datetime.now(timezone.utc)
    await db.flush()

    # Broadcast update
    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(item.shop_id),
        "item_id": str(item.id)
    })

    return ok(data={"deleted": True})


@router.patch("/{item_id}/availability", response_model=ApiResponse[dict])
async def toggle_availability(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    result = await db.execute(
        select(MenuItem).where(MenuItem.id == item_id, MenuItem.deleted_at.is_(None))
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, detail="ไม่พบเมนู")
    await _assert_owns_shop(db, item.shop_id, current_user)
    item.is_available = not item.is_available
    await db.flush()

    # Broadcast update
    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(item.shop_id),
        "item_id": str(item.id)
    })

    return ok(data={"is_available": item.is_available})


@router.post("/categories", response_model=ApiResponse[MenuCategorySchema], status_code=201)
async def create_category(
    data: MenuCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    await _assert_owns_shop(db, data.shop_id, current_user)
    name = data.name.strip()
    if not name:
        raise HTTPException(400, detail="กรุณาระบุชื่อหมวดหมู่")

    cat = MenuCategory(shop_id=data.shop_id, name=name, sort_order=data.sort_order)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)

    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(cat.shop_id),
    })

    return ok(data=MenuCategorySchema(
        id=cat.id, shop_id=cat.shop_id, name=cat.name,
        sort_order=cat.sort_order, items=[],
    ))


@router.patch("/categories/{category_id}", response_model=ApiResponse[MenuCategorySchema])
async def update_category(
    category_id: uuid.UUID,
    data: MenuCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, detail="ไม่พบหมวดหมู่")

    await _assert_owns_shop(db, cat.shop_id, current_user)

    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        if update_data["name"] is None:
            raise HTTPException(400, detail="กรุณาระบุชื่อหมวดหมู่")
        update_data["name"] = update_data["name"].strip()
        if not update_data["name"]:
            raise HTTPException(400, detail="กรุณาระบุชื่อหมวดหมู่")

    for field, value in update_data.items():
        setattr(cat, field, value)

    await db.flush()
    await db.refresh(cat)

    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(cat.shop_id),
    })

    return ok(data=MenuCategorySchema(
        id=cat.id, shop_id=cat.shop_id, name=cat.name,
        sort_order=cat.sort_order, items=[],
    ))


@router.delete("/categories/{category_id}", response_model=ApiResponse[dict])
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("merchant", "admin")),
):
    result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, detail="ไม่พบหมวดหมู่")

    await _assert_owns_shop(db, cat.shop_id, current_user)
    shop_id = cat.shop_id

    await db.execute(
        update(MenuItem)
        .where(MenuItem.category_id == category_id)
        .values(category_id=None)
    )
    await db.delete(cat)
    await db.flush()

    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "MENU_UPDATED",
        "shop_id": str(shop_id),
    })

    return ok(data={"deleted": True})
