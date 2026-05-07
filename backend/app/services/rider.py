import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.rider import RiderProfile, DeliveryJob
from app.models.order import Order
from app.models.shop import Shop
from app.models.user import User
from app.schemas.rider import EarningsOut, EarningDay
import structlog

logger = structlog.get_logger()


def _append_order_status_history(order: Order, status: str) -> None:
    history = list(order.status_history or [])
    history.append({"status": status, "timestamp": datetime.now(timezone.utc).isoformat()})
    order.status_history = history


async def _get_or_create_profile(db: AsyncSession, user: User) -> RiderProfile:
    result = await db.execute(
        select(RiderProfile).where(RiderProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = RiderProfile(user_id=user.id)
        db.add(profile)
        await db.flush()
        await db.refresh(profile)
    return profile


async def set_status(db: AsyncSession, user: User, status: str) -> RiderProfile:
    if status not in ("online", "offline"):
        raise ValueError("สถานะไม่ถูกต้อง")
    profile = await _get_or_create_profile(db, user)
    profile.status = status
    await db.flush()
    await db.refresh(profile)

    # Broadcast status change to admin
    from app.core.websocket import manager
    await manager.broadcast_event(
        {"type": "RIDER_STATUS_CHANGED", "user_id": str(user.id), "status": status},
        target_role="admin"
    )

    return profile


async def update_location(db: AsyncSession, user: User, lat: float, lng: float) -> RiderProfile:
    profile = await _get_or_create_profile(db, user)
    profile.current_latitude = lat
    profile.current_longitude = lng
    profile.last_location_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(profile)

    # Broadcast location to customer tracking this rider
    from app.core.websocket import manager
    
    # Find active order(s) for this rider
    order_result = await db.execute(
        select(Order.customer_id).where(
            Order.rider_id == user.id,
            Order.status.in_(["rider_assigned", "picked_up"])
        )
    )
    customer_ids = order_result.scalars().all()
    for cid in customer_ids:
        await manager.broadcast_event(
            {
                "type": "RIDER_LOCATION_UPDATED", 
                "rider_id": str(user.id), 
                "latitude": lat, 
                "longitude": lng
            },
            target_user=str(cid)
        )

    return profile


async def get_current_job(db: AsyncSession, user: User) -> DeliveryJob | None:
    result = await db.execute(
        select(DeliveryJob).where(
            DeliveryJob.rider_id == user.id,
            DeliveryJob.status.not_in(["delivered", "cancelled"]),
        ).order_by(DeliveryJob.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


async def accept_job(db: AsyncSession, job_id: uuid.UUID, user: User) -> DeliveryJob:
    logger.info("rider_accept_job_attempt", job_id=str(job_id), user_id=str(user.id))
    
    # Try to find an existing DeliveryJob first
    result = await db.execute(
        select(DeliveryJob).where(DeliveryJob.id == job_id).with_for_update()
    )
    job = result.scalar_one_or_none()

    if not job:
        # Broadcast model: job_id is actually an order_id — create the job on accept
        logger.info("rider_accept_job_broadcast_mode", order_id=str(job_id))
        order_result = await db.execute(
            select(Order).where(Order.id == job_id).with_for_update()
        )
        order = order_result.scalar_one_or_none()
        
        if not order:
            logger.warning("rider_accept_job_not_found", order_id=str(job_id))
            raise ValueError("ไม่พบออเดอร์หรืองานส่งที่ต้องการ")
            
        if order.rider_id is not None:
            logger.warning("rider_accept_job_already_taken", order_id=str(job_id), rider_id=str(order.rider_id))
            raise ValueError("ออเดอร์นี้มีไรเดอร์รับแล้ว")
            
        if order.status != "ready_for_pickup":
            logger.warning("rider_accept_job_invalid_status", order_id=str(job_id), status=order.status)
            raise ValueError("ออเดอร์นี้ยังไม่พร้อมให้ไรเดอร์รับงาน")

        job = DeliveryJob(
            order_id=order.id,
            rider_id=user.id,
            status="assigned",
            assigned_at=datetime.now(timezone.utc),
            delivery_fee=order.delivery_fee,
        )
        db.add(job)
        order.rider_id = user.id
        order.status = "rider_assigned"
        _append_order_status_history(order, "rider_assigned")
        
        logger.info("rider_accept_job_success_new_job", job_id=str(job.id), order_id=str(order.id))
        
        # Broadcast status update
        from app.core.websocket import manager
        event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": order.status}
        await manager.broadcast_event(event, target_user=str(order.customer_id))
        await manager.broadcast_event(event, target_user=str(user.id))
        
        shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
        owner_id = shop_result.scalar()
        if owner_id:
            await manager.broadcast_event(event, target_user=str(owner_id))

        await db.flush()
        await db.refresh(job)
        return job

    if job.status != "pending":
        logger.warning("rider_accept_job_not_pending", job_id=str(job_id), status=job.status)
        raise ValueError("งานนี้ไม่สามารถรับได้แล้ว")

    job.rider_id = user.id
    job.status = "assigned"
    job.assigned_at = datetime.now(timezone.utc)

    order_result = await db.execute(select(Order).where(Order.id == job.order_id).with_for_update())
    order = order_result.scalar_one_or_none()
    if order:
        order.rider_id = user.id
        order.status = "rider_assigned"
        _append_order_status_history(order, "rider_assigned")
        
        # Broadcast status update
        from app.core.websocket import manager
        event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": order.status}
        
        # Notify customer
        await manager.broadcast_event(event, target_user=str(order.customer_id))
        
        # Notify rider
        await manager.broadcast_event(event, target_user=str(user.id))
        
        # Notify merchant
        shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
        owner_id = shop_result.scalar()
        if owner_id:
            await manager.broadcast_event(event, target_user=str(owner_id))

    logger.info("rider_accept_job_success_existing_job", job_id=str(job.id))
    await db.flush()
    await db.refresh(job)
    return job


async def reject_job(db: AsyncSession, job_id: uuid.UUID, user: User) -> DeliveryJob:
    result = await db.execute(
        select(DeliveryJob)
        .where(or_(DeliveryJob.id == job_id, DeliveryJob.order_id == job_id))
        .with_for_update()
    )
    job = result.scalar_one_or_none()
    if not job:
        raise ValueError("ไม่พบงาน")
    if job.rider_id and job.rider_id != user.id:
        raise ValueError("คุณไม่มีสิทธิ์ปฏิเสธงานนี้")
    if job.status in ("picked_up", "delivered"):
        raise ValueError("รับอาหารแล้ว ไม่สามารถยกเลิกงานนี้ได้")

    rejected = list(job.rejected_by or [])
    rejected.append(user.id)
    job.rejected_by = rejected
    job.dispatch_attempts += 1

    if job.rider_id == user.id and job.status in ("assigned", "at_shop"):
        order_result = await db.execute(
            select(Order).where(Order.id == job.order_id).with_for_update()
        )
        order = order_result.scalar_one_or_none()

        job.status = "cancelled"
        job.rider_id = None
        if order:
            order.rider_id = None
            order.status = "ready_for_pickup"
            _append_order_status_history(order, "ready_for_pickup")

        profile_result = await db.execute(
            select(RiderProfile).where(RiderProfile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            profile.status = "online"

        if order:
            from app.core.websocket import manager
            event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": order.status}
            await manager.broadcast_event(event, target_user=str(order.customer_id))
            await manager.broadcast_event(event, target_user=str(user.id))

            shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
            owner_id = shop_result.scalar()
            if owner_id:
                await manager.broadcast_event(event, target_user=str(owner_id))

            await manager.broadcast_event(
                {"type": "ORDER_AVAILABLE", "order_id": str(order.id)},
                target_role="rider",
            )

    await db.flush()
    await db.refresh(job)
    return job


async def update_job_status(
    db: AsyncSession, job_id: uuid.UUID, user: User, status: str
) -> DeliveryJob:
    logger.info("rider_update_job_status_attempt", job_id=str(job_id), user_id=str(user.id), status=status)
    result = await db.execute(
        select(DeliveryJob).where(
            DeliveryJob.rider_id == user.id,
            or_(DeliveryJob.id == job_id, DeliveryJob.order_id == job_id),
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        logger.warning("rider_update_job_status_not_found", job_id=str(job_id), user_id=str(user.id))
        raise ValueError("ไม่พบงาน")

    now = datetime.now(timezone.utc)
    status_map = {
        "at_shop":       ("arrived_shop_at", "picked_up"),
        "picked_up":     ("picked_up_at", "picked_up"),
        "at_customer":   ("arrived_customer_at", "picked_up"),
        "delivered":     ("delivered_at", "delivered"),
    }

    ts_field, _ = status_map.get(status, (None, None))
    job.status = status
    if ts_field:
        setattr(job, ts_field, now)

    # Mirror to order
    order_status_map = {
        "at_shop":   "rider_assigned",
        "picked_up": "picked_up",
        "delivered": "delivered",
    }
    if status in order_status_map:
        order_result = await db.execute(select(Order).where(Order.id == job.order_id))
        order = order_result.scalar_one_or_none()
        if order:
            order.status = order_status_map[status]
            _append_order_status_history(order, order.status)
            if status == "delivered":
                order.delivered_at = now
                order.payment_status = "confirmed"
            
            # Broadcast status update
            from app.core.websocket import manager
            event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": order.status}
            
            # Notify customer
            await manager.broadcast_event(event, target_user=str(order.customer_id))

            # Notify rider
            await manager.broadcast_event(event, target_user=str(user.id))

            # Notify merchant
            shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))

            owner_id = shop_result.scalar()
            if owner_id:
                await manager.broadcast_event(event, target_user=str(owner_id))
            
            # Notify rider
            await manager.broadcast_event(event, target_user=str(user.id))

    if status == "delivered":
        profile_result = await db.execute(
            select(RiderProfile).where(RiderProfile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            profile.total_deliveries += 1
            profile.total_earnings += job.delivery_fee + job.tip
            profile.status = "online"

    await db.flush()
    await db.refresh(job)
    return job


async def get_earnings(db: AsyncSession, user: User) -> EarningsOut:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)
    month_start = today_start - timedelta(days=29)

    # Jobs delivered in the last 30 days. Some older rider flows updated Order
    # directly, so treat the linked order's delivered status/time as a fallback.
    jobs_result = await db.execute(
        select(DeliveryJob, Order.delivered_at.label("order_delivered_at"))
        .join(Order, Order.id == DeliveryJob.order_id)
        .where(
            and_(
                DeliveryJob.rider_id == user.id,
                or_(DeliveryJob.status == "delivered", Order.status == "delivered"),
                func.coalesce(DeliveryJob.delivered_at, Order.delivered_at, DeliveryJob.created_at) >= month_start,
            )
        )
    )
    job_rows = jobs_result.all()

    total_month = sum(j.delivery_fee + j.tip for j, _ in job_rows)
    total_week = sum(
        j.delivery_fee + j.tip
        for j, order_delivered_at in job_rows
        if (j.delivered_at or order_delivered_at or j.created_at) >= week_start
    )
    total_today = sum(
        j.delivery_fee + j.tip
        for j, order_delivered_at in job_rows
        if (j.delivered_at or order_delivered_at or j.created_at) >= today_start
    )

    # Build day-by-day breakdown
    days_map: dict[str, EarningDay] = {}
    for i in range(7):
        d = today_start - timedelta(days=i)
        key = d.strftime("%Y-%m-%d")
        days_map[key] = EarningDay(date=key, amount=0, jobs=0)

    for j, order_delivered_at in job_rows:
        delivered_at = j.delivered_at or order_delivered_at or j.created_at
        if delivered_at:
            key = delivered_at.strftime("%Y-%m-%d")
            if key in days_map:
                days_map[key].amount += j.delivery_fee + j.tip
                days_map[key].jobs += 1

    days = sorted(days_map.values(), key=lambda d: d.date)

    return EarningsOut(
        total_today=total_today,
        total_week=total_week,
        total_month=total_month,
        total_deliveries=len(job_rows),
        days=days,
        next_payout=total_week,
        next_payout_date=(today_start + timedelta(days=(7 - today_start.weekday()))).strftime("%d/%m/%y"),
    )


async def get_history(
    db: AsyncSession, user: User, page: int = 1, limit: int = 20
) -> tuple[list[DeliveryJob], int]:
    q = (
        select(DeliveryJob)
        .join(Order, Order.id == DeliveryJob.order_id)
        .where(
            DeliveryJob.rider_id == user.id,
            or_(DeliveryJob.status == "delivered", Order.status == "delivered"),
        )
    )
    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar() or 0

    q = q.order_by(func.coalesce(DeliveryJob.delivered_at, Order.delivered_at, DeliveryJob.created_at).desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return result.scalars().all(), total
