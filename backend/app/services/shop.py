from uuid import UUID
from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, delete

from app.models.shop import Shop, ShopHours
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem
from app.models.settlement import Settlement
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopUpdate, ShopHoursUpdateItem


async def list_shops(
    db: AsyncSession,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Shop], int]:
    base = and_(Shop.deleted_at.is_(None), Shop.status == "active")

    filters = [base]
    if category:
        filters.append(Shop.cuisine_types.any(category))
    if search:
        filters.append(
            or_(
                Shop.name.ilike(f"%{search}%"),
                Shop.description.ilike(f"%{search}%"),
            )
        )

    count_q = select(func.count()).select_from(Shop).where(*filters)
    total: int = await db.scalar(count_q) or 0

    query = (
        select(Shop)
        .where(*filters)
        .order_by(Shop.is_open.desc(), Shop.name)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    shops = list(result.scalars().all())
    return shops, total


async def get_shop_with_hours(
    db: AsyncSession, shop_id: UUID
) -> tuple[Optional[Shop], list[ShopHours]]:
    shop_q = select(Shop).where(and_(Shop.id == shop_id, Shop.deleted_at.is_(None)))
    shop = await db.scalar(shop_q)
    if not shop:
        return None, []

    hours_q = select(ShopHours).where(ShopHours.shop_id == shop_id)
    result = await db.execute(hours_q)
    hours = list(result.scalars().all())
    return shop, hours


async def get_shop_menu(db: AsyncSession, shop_id: UUID) -> list[dict]:
    cats_q = (
        select(MenuCategory)
        .where(MenuCategory.shop_id == shop_id)
        .order_by(MenuCategory.sort_order)
    )
    result = await db.execute(cats_q)
    categories = result.scalars().all()

    items_q = (
        select(MenuItem)
        .where(and_(MenuItem.shop_id == shop_id, MenuItem.deleted_at.is_(None)))
        .order_by(MenuItem.sort_order)
    )
    result = await db.execute(items_q)
    items = list(result.scalars().all())

    items_by_cat: dict[str, list] = {}
    uncategorized: list = []
    for item in items:
        if item.category_id:
            items_by_cat.setdefault(str(item.category_id), []).append(item)
        else:
            uncategorized.append(item)

    grouped = []
    for cat in categories:
        grouped.append({
            "id": cat.id,
            "shop_id": cat.shop_id,
            "name": cat.name,
            "sort_order": cat.sort_order,
            "items": items_by_cat.get(str(cat.id), []),
        })

    if uncategorized:
        grouped.append({
            "id": None,
            "shop_id": shop_id,
            "name": "อื่นๆ",
            "sort_order": 9999,
            "items": uncategorized,
        })

    return grouped


async def get_shop_by_owner(db: AsyncSession, owner_id: UUID) -> Optional[Shop]:
    return await db.scalar(
        select(Shop).where(and_(Shop.owner_id == owner_id, Shop.deleted_at.is_(None)))
    )


async def get_merchant_revenue(db: AsyncSession, shop_id: UUID, owner_id: UUID) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)
    month_start = today_start.replace(day=1)
    EXCLUDED = ("cancelled", "refunded", "pending_payment")

    async def period_stats(from_dt: datetime) -> dict:
        row = (await db.execute(
            select(func.count(Order.id), func.coalesce(func.sum(Order.subtotal), 0))
            .where(Order.shop_id == shop_id, Order.created_at >= from_dt,
                   Order.status.notin_(EXCLUDED))
        )).one()
        count, gross = int(row[0]), int(row[1])
        return {"gross": gross, "orders": count, "avg": (gross // count) if count else 0}

    today_stats = await period_stats(today_start)
    week_stats  = await period_stats(week_start)
    month_stats = await period_stats(month_start)

    # Daily breakdown — last 7 days oldest→newest
    days = []
    for i in range(6, -1, -1):
        d_start = today_start - timedelta(days=i)
        d_end = d_start + timedelta(days=1)
        gross = int((await db.execute(
            select(func.coalesce(func.sum(Order.subtotal), 0))
            .where(Order.shop_id == shop_id, Order.created_at >= d_start,
                   Order.created_at < d_end, Order.status.notin_(EXCLUDED))
        )).scalar() or 0)
        days.append({"date": d_start.date().isoformat(), "gross": gross})

    # Top items — last 30 days
    thirty_ago = today_start - timedelta(days=29)
    top_rows = (await db.execute(
        select(
            OrderItem.item_name,
            func.sum(OrderItem.quantity).label("qty"),
            func.sum(OrderItem.line_total).label("total"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.shop_id == shop_id, Order.created_at >= thirty_ago,
               Order.status.notin_(EXCLUDED))
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    )).fetchall()
    top_items = [{"name": r.item_name, "qty": int(r.qty), "total": int(r.total)} for r in top_rows]

    # Settlements for this merchant
    settlement_rows = (await db.execute(
        select(Settlement)
        .where(Settlement.recipient_id == owner_id, Settlement.recipient_type == "merchant")
        .order_by(Settlement.created_at.desc())
        .limit(6)
    )).scalars().all()

    next_payout = 0
    settlements = []
    for s in settlement_rows:
        if s.status == "pending":
            next_payout += s.net_amount
        settlements.append({
            "id": str(s.id),
            "period_start": s.period_start.isoformat() if s.period_start else None,
            "period_end":   s.period_end.isoformat()   if s.period_end   else None,
            "gross":   s.gross_amount,
            "fee":     s.commission,
            "net":     s.net_amount,
            "status":  s.status,
            "paid_at": s.paid_at.isoformat() if s.paid_at else None,
        })

    # Next payout date = coming Monday
    days_until_monday = (7 - now.weekday()) % 7 or 7
    next_payout_date = (today_start + timedelta(days=days_until_monday)).date().isoformat()

    return {
        "today":  today_stats,
        "week":   week_stats,
        "month":  month_stats,
        "days":   days,
        "top_items":   top_items,
        "settlements": settlements,
        "next_payout":      next_payout,
        "next_payout_date": next_payout_date,
    }


async def create_shop(db: AsyncSession, owner_id: UUID, data: ShopCreate) -> Shop:
    shop = Shop(owner_id=owner_id, **data.model_dump())
    db.add(shop)
    await db.commit()
    await db.refresh(shop)

    # Broadcast to admin
    from app.core.websocket import manager
    await manager.broadcast_event({"type": "SHOP_CREATED", "shop_id": str(shop.id)}, target_role="admin")

    return shop


async def update_shop(
    db: AsyncSession, shop_id: UUID, current_user: User, data: ShopUpdate
) -> Optional[Shop]:
    shop = await db.scalar(
        select(Shop).where(and_(Shop.id == shop_id, Shop.deleted_at.is_(None)))
    )
    if not shop:
        return None
    if current_user.role != "admin" and shop.owner_id != current_user.id:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shop, field, value)

    await db.commit()
    await db.refresh(shop)

    # Broadcast to all
    from app.core.websocket import manager
    await manager.broadcast_event({"type": "SHOP_UPDATED", "shop_id": str(shop.id)})

    return shop


async def toggle_shop(
    db: AsyncSession, shop_id: UUID, current_user: User
) -> Optional[Shop]:
    shop = await db.scalar(
        select(Shop).where(and_(Shop.id == shop_id, Shop.deleted_at.is_(None)))
    )
    if not shop:
        return None
    if current_user.role != "admin" and shop.owner_id != current_user.id:
        return None

    shop.is_open = not shop.is_open
    await db.commit()
    await db.refresh(shop)

    # Broadcast shop status change to all users (for home list)
    from app.core.websocket import manager
    await manager.broadcast_event({
        "type": "SHOP_STATUS_CHANGED",
        "shop_id": str(shop.id),
        "is_open": shop.is_open
    })

    return shop


async def get_my_shop_hours(db: AsyncSession, owner_id: UUID) -> tuple[Optional[Shop], list[ShopHours]]:
    shop = await get_shop_by_owner(db, owner_id)
    if not shop:
        return None, []

    hours_q = select(ShopHours).where(ShopHours.shop_id == shop.id).order_by(ShopHours.day)
    result = await db.execute(hours_q)
    hours = list(result.scalars().all())
    return shop, hours


async def update_my_shop_hours(
    db: AsyncSession,
    owner_id: UUID,
    items: list[ShopHoursUpdateItem],
) -> tuple[Optional[Shop], list[ShopHours]]:
    shop = await get_shop_by_owner(db, owner_id)
    if not shop:
        return None, []

    valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
    for item in items:
        if item.day not in valid_days:
            raise ValueError(f"วันไม่ถูกต้อง: {item.day}")

    # Bulk replace strategy
    await db.execute(delete(ShopHours).where(ShopHours.shop_id == shop.id))

    for item in items:
        new_hours = ShopHours(
            shop_id=shop.id,
            day=item.day,
            open_time=item.open_time,
            close_time=item.close_time,
            is_closed=item.is_closed
        )
        db.add(new_hours)

    await db.commit()

    # Re-query
    hours_q = select(ShopHours).where(ShopHours.shop_id == shop.id).order_by(ShopHours.day)
    result = await db.execute(hours_q)
    hours = list(result.scalars().all())
    return shop, hours
