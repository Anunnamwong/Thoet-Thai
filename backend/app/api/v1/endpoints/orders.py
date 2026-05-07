import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.order import OrderItem
from app.models.shop import Shop
from app.models.menu import MenuItem
from app.schemas.order import (
    OrderCreate, OrderOut, OrderListItem,
    OrderItemOut, UpdateStatusRequest, CancelRequest,
)
from app.schemas.common import ApiResponse, ok
from app.services import order as order_svc

router = APIRouter()


def _to_list_item(order, shop_name: str | None, item_count: int) -> OrderListItem:
    return OrderListItem(
        id=order.id,
        order_number=order.order_number,
        shop_id=order.shop_id,
        shop_name=shop_name,
        status=order.status,
        total=order.total,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        item_count=item_count,
        created_at=order.created_at,
    )


@router.post("/validate", response_model=ApiResponse[dict])
async def validate_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Validate order data without creating it."""
    try:
        # We reuse the logic from create_order but rollback at the end
        # or just implement a non-persisting validation
        shop_result = await db.execute(
            select(Shop).where(Shop.id == data.shop_id, Shop.deleted_at.is_(None))
        )
        shop = shop_result.scalar_one_or_none()
        if not shop:
            raise ValueError("ไม่พบร้านค้า")
        
        if not await order_svc._is_shop_open(db, shop):
            return ok(data={"valid": False, "reason": "shop_closed"})

        for it in data.items:
            mi_result = await db.execute(
                select(MenuItem).where(
                    MenuItem.id == it.menu_item_id,
                    MenuItem.shop_id == data.shop_id,
                    MenuItem.deleted_at.is_(None),
                )
            )
            mi = mi_result.scalar_one_or_none()
            if not mi:
                return ok(data={"valid": False, "reason": f"item_not_found: {it.menu_item_id}"})
            if not mi.is_available:
                return ok(data={"valid": False, "reason": f"item_unavailable: {mi.name}"})
            if mi.price != it.item_price: # Optional: check for price changes
                return ok(data={"valid": False, "reason": "price_changed"})

        return ok(data={"valid": True})
    except Exception as e:
        return ok(data={"valid": False, "reason": str(e)})


@router.post("", response_model=ApiResponse[OrderOut], status_code=201)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("customer", "admin"):
        raise HTTPException(403, detail="เฉพาะลูกค้าเท่านั้นที่สั่งอาหารได้")
    try:
        order = await order_svc.create_order(db, current_user, data)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

    items = await order_svc.get_order_items(db, order.id)
    out = OrderOut.model_validate(order)
    out.items = [OrderItemOut.model_validate(i) for i in items]
    return ok(data=out)


@router.get("", response_model=ApiResponse[list[OrderListItem]])
async def list_orders(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders, total = await order_svc.list_orders(db, current_user, status, page, limit)

    # Batch-load shop names
    shop_ids = list({o.shop_id for o in orders})
    shops_result = await db.execute(select(Shop).where(Shop.id.in_(shop_ids)))
    shop_map = {s.id: s.name for s in shops_result.scalars()}

    # Batch-load item counts
    from sqlalchemy import func
    counts_result = await db.execute(
        select(OrderItem.order_id, func.count(OrderItem.id))
        .where(OrderItem.order_id.in_([o.id for o in orders]))
        .group_by(OrderItem.order_id)
    )
    count_map = {row[0]: row[1] for row in counts_result.fetchall()}

    items_out = [
        _to_list_item(o, shop_map.get(o.shop_id), count_map.get(o.id, 0))
        for o in orders
    ]
    return ok(
        data=items_out,
        meta={"page": page, "total": total, "has_next": (page * limit) < total},
    )


@router.get("/{order_id}", response_model=ApiResponse[OrderOut])
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = await order_svc.get_order(db, order_id, current_user)
    if not order:
        raise HTTPException(404, detail="ไม่พบออเดอร์")
    items = await order_svc.get_order_items(db, order.id)
    out = OrderOut.model_validate(order)
    out.items = [OrderItemOut.model_validate(i) for i in items]
    return ok(data=out)


@router.patch("/{order_id}/status", response_model=ApiResponse[OrderOut])
async def update_status(
    order_id: uuid.UUID,
    data: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        order = await order_svc.update_status(db, order_id, current_user, data)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    items = await order_svc.get_order_items(db, order.id)
    out = OrderOut.model_validate(order)
    out.items = [OrderItemOut.model_validate(i) for i in items]
    return ok(data=out)


@router.post("/{order_id}/cancel", response_model=ApiResponse[OrderOut])
async def cancel_order(
    order_id: uuid.UUID,
    data: CancelRequest = CancelRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        order = await order_svc.cancel_order(db, order_id, current_user, data.reason)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    items = await order_svc.get_order_items(db, order.id)
    out = OrderOut.model_validate(order)
    out.items = [OrderItemOut.model_validate(i) for i in items]
    return ok(data=out)
