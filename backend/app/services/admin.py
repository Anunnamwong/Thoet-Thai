import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.user import User
from app.models.shop import Shop
from app.models.rider import RiderProfile
from app.models.order import Order
from app.models.settlement import Settlement


async def get_dashboard_stats(db: AsyncSession) -> dict:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    orders_today = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= today_start)
    )).scalar() or 0

    revenue_today = (await db.execute(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            and_(Order.created_at >= today_start, Order.status == "delivered")
        )
    )).scalar() or 0

    online_riders = (await db.execute(
        select(func.count(RiderProfile.id)).where(RiderProfile.status == "online")
    )).scalar() or 0

    total_riders = (await db.execute(
        select(func.count(RiderProfile.id))
    )).scalar() or 0

    pending_merchants = (await db.execute(
        select(func.count(Shop.id)).where(Shop.status == "pending_approval")
    )).scalar() or 0

    pending_riders = (await db.execute(
        select(func.count(RiderProfile.id)).where(RiderProfile.approved_at.is_(None))
    )).scalar() or 0

    # Recent orders (last 10)
    recent_result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(10)
    )
    recent_orders = recent_result.scalars().all()

    return {
        "orders_today": orders_today,
        "revenue_today": revenue_today,
        "online_riders": online_riders,
        "total_riders": total_riders,
        "pending_approvals": pending_merchants + pending_riders,
        "pending_merchants": pending_merchants,
        "pending_riders": pending_riders,
        "recent_orders": recent_orders,
    }


async def list_merchants(
    db: AsyncSession,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Shop], int]:
    q = select(Shop).where(Shop.deleted_at.is_(None))
    if status:
        q = q.where(Shop.status == status)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar() or 0

    q = q.order_by(Shop.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return result.scalars().all(), total


async def approve_merchant(db: AsyncSession, shop_id: uuid.UUID, admin: User) -> Shop:
    result = await db.execute(
        select(Shop).where(Shop.id == shop_id, Shop.deleted_at.is_(None))
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise ValueError("ไม่พบร้านค้า")
    shop.status = "active"
    shop.approved_at = datetime.now(timezone.utc)
    shop.approved_by = admin.id
    await db.flush()
    await db.refresh(shop)

    # Broadcast approval to merchant
    from app.core.websocket import manager
    await manager.broadcast_event(
        {"type": "SHOP_APPROVED", "shop_id": str(shop.id)},
        target_user=str(shop.owner_id)
    )

    return shop


async def suspend_merchant(db: AsyncSession, shop_id: uuid.UUID) -> Shop:
    result = await db.execute(
        select(Shop).where(Shop.id == shop_id, Shop.deleted_at.is_(None))
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise ValueError("ไม่พบร้านค้า")
    shop.status = "suspended"
    await db.flush()
    await db.refresh(shop)

    # Broadcast suspension to merchant
    from app.core.websocket import manager
    await manager.broadcast_event(
        {"type": "SHOP_SUSPENDED", "shop_id": str(shop.id)},
        target_user=str(shop.owner_id)
    )

    return shop


async def list_riders(
    db: AsyncSession,
    approved: bool | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list, int]:
    q = select(RiderProfile, User).join(User, RiderProfile.user_id == User.id).where(
        User.deleted_at.is_(None), User.is_active.is_(True)
    )
    if approved is True:
        q = q.where(RiderProfile.approved_at.is_not(None))
    elif approved is False:
        q = q.where(RiderProfile.approved_at.is_(None))

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar() or 0

    q = q.order_by(RiderProfile.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    rows = result.fetchall()
    return rows, total


async def approve_rider(db: AsyncSession, user_id: uuid.UUID, admin: User) -> RiderProfile:
    result = await db.execute(
        select(RiderProfile).where(RiderProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("ไม่พบข้อมูลไรเดอร์")
    profile.approved_at = datetime.now(timezone.utc)
    profile.approved_by = admin.id
    await db.flush()
    await db.refresh(profile)

    # Broadcast approval to rider
    from app.core.websocket import manager
    await manager.broadcast_event(
        {"type": "RIDER_APPROVED", "user_id": str(profile.user_id)},
        target_user=str(profile.user_id)
    )

    return profile


async def list_settlements(
    db: AsyncSession,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Settlement], int]:
    q = select(Settlement)
    if status:
        q = q.where(Settlement.status == status)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar() or 0

    q = q.order_by(Settlement.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return result.scalars().all(), total


async def confirm_settlement(
    db: AsyncSession, settlement_id: uuid.UUID, admin: User
) -> Settlement:
    result = await db.execute(
        select(Settlement).where(Settlement.id == settlement_id)
    )
    s = result.scalar_one_or_none()
    if not s:
        raise ValueError("ไม่พบรายการชำระเงิน")
    if s.status != "pending":
        raise ValueError("รายการนี้ดำเนินการแล้ว")
    s.status = "completed"
    s.paid_at = datetime.now(timezone.utc)
    s.paid_by = admin.id
    await db.flush()
    await db.refresh(s)
    return s
