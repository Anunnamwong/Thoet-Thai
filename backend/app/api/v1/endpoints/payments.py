import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.common import ApiResponse, ok
from app.services import payment as payment_svc

router = APIRouter()


class PromptPayCreateRequest(BaseModel):
    order_id: uuid.UUID


class PromptPayMockConfirmRequest(BaseModel):
    order_id: uuid.UUID
    slip_image_url: str | None = None


@router.post("/promptpay", response_model=ApiResponse[dict], status_code=201)
async def create_promptpay(
    data: PromptPayCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        payment = await payment_svc.create_promptpay_payment(db, data.order_id, current_user.id)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={
        "id": str(payment.id),
        "qr_payload": payment.qr_payload,
        "amount": payment.amount,
        "status": payment.status,
    })


@router.post("/promptpay/mock-confirm", response_model=ApiResponse[dict])
async def mock_confirm_promptpay(
    data: PromptPayMockConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("customer")),
):
    try:
        payment = await payment_svc.mock_confirm_promptpay(
            db,
            data.order_id,
            current_user.id,
            data.slip_image_url,
        )
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={"id": str(payment.id), "status": payment.status})


@router.post("/{payment_id}/verify", response_model=ApiResponse[dict])
async def verify_payment(
    payment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        payment = await payment_svc.verify_payment(db, payment_id, current_user.id)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data={"id": str(payment.id), "status": payment.status})
