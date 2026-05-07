import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class RiderStatusUpdate(BaseModel):
    status: str  # offline | online


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


class JobStatusUpdate(BaseModel):
    status: str  # at_shop | picked_up | at_customer | delivered


class JobOut(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    order_number: str | None = None
    shop_name: str | None = None
    shop_address: str | None = None
    customer_address: str | None = None
    payment_method: str | None = None
    order_total: int | None = None
    status: str
    delivery_fee: int
    assigned_at: datetime | None = None
    picked_up_at: datetime | None = None
    delivered_at: datetime | None = None
    distance_km: Decimal | None = None

    model_config = {"from_attributes": True}


class EarningDay(BaseModel):
    date: str
    amount: int
    jobs: int


class EarningsOut(BaseModel):
    total_today: int
    total_week: int
    total_month: int
    total_deliveries: int
    days: list[EarningDay] = []
    next_payout: int
    next_payout_date: str | None = None


class HistoryItemOut(BaseModel):
    id: uuid.UUID
    order_number: str | None = None
    shop_name: str | None = None
    customer_address: str | None = None
    status: str
    delivery_fee: int
    distance_km: Decimal | None = None
    delivered_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
