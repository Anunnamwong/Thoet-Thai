import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.models.order import Order
from app.models.shop import Shop
from app.schemas.rider import (
    RiderStatusUpdate, LocationUpdate, JobStatusUpdate,
    JobOut, EarningsOut, HistoryItemOut,
)
from app.schemas.common import ApiResponse, ok
from app.services import rider as rider_svc

router = APIRouter()


def _job_to_out(job, order: Order | None = None, shop: Shop | None = None) -> JobOut:
    return JobOut(
        id=job.id,
        order_id=job.order_id,
        order_number=order.order_number if order else None,
        shop_name=shop.name if shop else None,
        shop_address=shop.full_address if shop else None,
        customer_address=order.delivery_address if order else None,
        payment_method=order.payment_method if order else None,
        order_total=order.total if order else None,
        status=job.status,
        delivery_fee=job.delivery_fee,
        assigned_at=job.assigned_at,
        picked_up_at=job.picked_up_at,
        delivered_at=job.delivered_at,
        distance_km=job.distance_km,
    )


@router.get("/profile", response_model=ApiResponse[dict])
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    profile = await rider_svc._get_or_create_profile(db, current_user)
    return ok(data={
        "status": profile.status,
        "vehicle_type": profile.vehicle_type,
        "license_plate": profile.license_plate,
    })


@router.patch("/status", response_model=ApiResponse[dict])
async def set_status(
    data: RiderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    try:
        profile = await rider_svc.set_status(db, current_user, data.status)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={"status": profile.status})


@router.patch("/location", response_model=ApiResponse[dict])
async def update_location(
    data: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    await rider_svc.update_location(db, current_user, data.latitude, data.longitude)
    return ok(data={"updated": True})


@router.get("/current-job", response_model=ApiResponse[JobOut | None])
async def get_current_job(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    job = await rider_svc.get_current_job(db, current_user)
    if not job:
        return ok(data=None)
    order_result = await db.execute(select(Order).where(Order.id == job.order_id))
    order = order_result.scalar_one_or_none()
    shop = None
    if order:
        shop_result = await db.execute(select(Shop).where(Shop.id == order.shop_id))
        shop = shop_result.scalar_one_or_none()
    return ok(data=_job_to_out(job, order, shop))


@router.post("/jobs/{job_id}/accept", response_model=ApiResponse[JobOut])
async def accept_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    try:
        job = await rider_svc.accept_job(db, job_id, current_user)
        await db.commit() # Force commit before fetching order details for response
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    
    order_result = await db.execute(select(Order).where(Order.id == job.order_id))
    order = order_result.scalar_one_or_none()
    shop = None
    if order:
        shop_result = await db.execute(select(Shop).where(Shop.id == order.shop_id))
        shop = shop_result.scalar_one_or_none()
    return ok(data=_job_to_out(job, order, shop))


@router.post("/jobs/{job_id}/reject", response_model=ApiResponse[dict])
async def reject_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    try:
        await rider_svc.reject_job(db, job_id, current_user)
        await db.commit()
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={"rejected": True})


@router.patch("/jobs/{job_id}/status", response_model=ApiResponse[JobOut])
async def update_job_status(
    job_id: uuid.UUID,
    data: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    try:
        job = await rider_svc.update_job_status(db, job_id, current_user, data.status)
        await db.commit()
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    
    order_result = await db.execute(select(Order).where(Order.id == job.order_id))
    order = order_result.scalar_one_or_none()
    shop = None
    if order:
        shop_result = await db.execute(select(Shop).where(Shop.id == order.shop_id))
        shop = shop_result.scalar_one_or_none()
    return ok(data=_job_to_out(job, order, shop))


@router.get("/earnings", response_model=ApiResponse[EarningsOut])
async def get_earnings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    earnings = await rider_svc.get_earnings(db, current_user)
    return ok(data=earnings)


@router.get("/history", response_model=ApiResponse[list[HistoryItemOut]])
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("rider")),
):
    jobs, total = await rider_svc.get_history(db, current_user, page, limit)

    # Batch-load orders for order_number and customer_address
    order_ids = [j.order_id for j in jobs]
    orders_result = await db.execute(select(Order).where(Order.id.in_(order_ids)))
    order_map = {o.id: o for o in orders_result.scalars()}

    shop_ids = [o.shop_id for o in order_map.values()]
    shops_result = await db.execute(select(Shop).where(Shop.id.in_(shop_ids)))
    shop_map = {s.id: s for s in shops_result.scalars()}

    items = []
    for job in jobs:
        order = order_map.get(job.order_id)
        shop = shop_map.get(order.shop_id) if order else None
        delivered_at = job.delivered_at or (order.delivered_at if order else None) or job.created_at
        status = "delivered" if order and order.status == "delivered" else job.status
        items.append(HistoryItemOut(
            id=job.id,
            order_number=order.order_number if order else None,
            shop_name=shop.name if shop else None,
            customer_address=order.delivery_address if order else None,
            status=status,
            delivery_fee=job.delivery_fee,
            distance_km=job.distance_km,
            delivered_at=delivered_at,
            created_at=job.created_at,
        ))

    return ok(
        data=items,
        meta={"page": page, "total": total, "has_next": (page * limit) < total},
    )
