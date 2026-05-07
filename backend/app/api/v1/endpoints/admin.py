import uuid
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.deps import get_db, require_role
from app.models.user import User
from app.models.shop import Shop
from app.models.settlement import Settlement
from app.schemas.shop import ShopListItem
from app.schemas.common import ApiResponse, ok
from app.services import admin as admin_svc

router = APIRouter()


@router.get("/dashboard", response_model=ApiResponse[dict])
async def dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    stats = await admin_svc.get_dashboard_stats(db)
    # Serialize recent_orders (Order objects) to dicts
    recent = []
    for o in stats.pop("recent_orders", []):
        recent.append({
            "id": str(o.id),
            "order_number": o.order_number,
            "shop_id": str(o.shop_id),
            "status": o.status,
            "total": o.total,
            "payment_method": o.payment_method,
            "created_at": o.created_at.isoformat(),
        })
    stats["recent_orders"] = recent
    return ok(data=stats)


@router.get("/merchants", response_model=ApiResponse[list[dict]])
async def list_merchants(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    shops, total = await admin_svc.list_merchants(db, status, page, limit)
    data = [
        {
            "id": str(s.id),
            "name": s.name,
            "status": s.status,
            "is_open": s.is_open,
            "full_address": s.full_address,
            "phone": s.phone,
            "cuisine_types": s.cuisine_types,
            "bank_name": s.bank_name,
            "bank_account": s.bank_account,
            "approved_at": s.approved_at.isoformat() if s.approved_at else None,
            "created_at": s.created_at.isoformat(),
        }
        for s in shops
    ]
    return ok(data=data, meta={"page": page, "total": total, "has_next": (page * limit) < total})


@router.patch("/merchants/{shop_id}/approve", response_model=ApiResponse[dict])
async def approve_merchant(
    shop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        shop = await admin_svc.approve_merchant(db, shop_id, current_user)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
    return ok(data={"id": str(shop.id), "status": shop.status})


@router.patch("/merchants/{shop_id}/suspend", response_model=ApiResponse[dict])
async def suspend_merchant(
    shop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        shop = await admin_svc.suspend_merchant(db, shop_id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
    return ok(data={"id": str(shop.id), "status": shop.status})


@router.get("/riders", response_model=ApiResponse[list[dict]])
async def list_riders(
    approved: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    rows, total = await admin_svc.list_riders(db, approved, page, limit)
    data = [
        {
            "user_id": str(u.id),
            "display_name": u.display_name,
            "phone": u.phone,
            "vehicle_type": r.vehicle_type,
            "license_plate": r.license_plate,
            "status": r.status,
            "approved_at": r.approved_at.isoformat() if r.approved_at else None,
            "total_deliveries": r.total_deliveries,
            "bank_name": r.bank_name,
            "bank_account": r.bank_account,
            "created_at": r.created_at.isoformat(),
        }
        for r, u in rows
    ]
    return ok(data=data, meta={"page": page, "total": total, "has_next": (page * limit) < total})


@router.patch("/riders/{user_id}/approve", response_model=ApiResponse[dict])
async def approve_rider(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        profile = await admin_svc.approve_rider(db, user_id, current_user)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
    return ok(data={"user_id": str(profile.user_id), "approved_at": profile.approved_at.isoformat()})


@router.get("/settlements", response_model=ApiResponse[list[dict]])
async def list_settlements(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    settlements, total = await admin_svc.list_settlements(db, status, page, limit)
    data = [
        {
            "id": str(s.id),
            "recipient_id": str(s.recipient_id),
            "recipient_type": s.recipient_type,
            "period_start": s.period_start.isoformat() if s.period_start else None,
            "period_end": s.period_end.isoformat() if s.period_end else None,
            "gross_amount": float(s.gross_amount),
            "commission": float(s.commission),
            "net_amount": float(s.net_amount),
            "status": s.status,
            "paid_at": s.paid_at.isoformat() if s.paid_at else None,
            "bank_ref": s.bank_ref,
        }
        for s in settlements
    ]
    return ok(data=data, meta={"page": page, "total": total, "has_next": (page * limit) < total})


@router.post("/settlements/{settlement_id}/confirm", response_model=ApiResponse[dict])
async def confirm_settlement(
    settlement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        s = await admin_svc.confirm_settlement(db, settlement_id, current_user)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={"id": str(s.id), "status": s.status})


@router.get("/settlements/export")
async def export_settlements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Export all settlements to CSV."""
    result = await db.execute(select(Settlement).order_by(Settlement.created_at.desc()))
    settlements = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Recipient Type", "Recipient ID", "Net Amount", "Status", "Created At", "Paid At"])
    
    for s in settlements:
        writer.writerow([
            str(s.id),
            s.recipient_type,
            str(s.recipient_id),
            float(s.net_amount),
            s.status,
            s.created_at.isoformat(),
            s.paid_at.isoformat() if s.paid_at else ""
        ])
    
    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=settlements.csv"}
    )
