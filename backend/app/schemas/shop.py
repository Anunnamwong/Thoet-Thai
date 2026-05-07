from pydantic import BaseModel
from datetime import datetime, time
from uuid import UUID
from typing import Optional, List


class ShopHoursSchema(BaseModel):
    id: UUID
    shop_id: UUID
    day: str
    open_time: time
    close_time: time
    is_closed: bool

    model_config = {"from_attributes": True}


class ShopHoursUpdateItem(BaseModel):
    day: str            # one of: 'mon','tue','wed','thu','fri','sat','sun'
    open_time: time
    close_time: time
    is_closed: bool = False


class ShopListItem(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str
    is_open: bool
    full_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_types: List[str]
    avg_cooking_time: int
    minimum_order: int
    delivery_fee: int

    model_config = {"from_attributes": True}


class ShopDetail(ShopListItem):
    owner_id: UUID
    phone: Optional[str] = None
    hours: List[ShopHoursSchema] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ShopCreate(BaseModel):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    full_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_types: List[str] = []
    avg_cooking_time: int = 15
    minimum_order: int = 0
    delivery_fee: int = 15
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_account_name: Optional[str] = None


class DayRevenue(BaseModel):
    date: str
    gross: int


class TopItem(BaseModel):
    name: str
    qty: int
    total: int


class MerchantSettlementOut(BaseModel):
    id: str
    period_start: str | None
    period_end: str | None
    gross: int
    fee: int
    net: int
    status: str
    paid_at: str | None


class PeriodStats(BaseModel):
    gross: int
    orders: int
    avg: int


class MerchantRevenueOut(BaseModel):
    today: PeriodStats
    week: PeriodStats
    month: PeriodStats
    days: list[DayRevenue]
    top_items: list[TopItem]
    settlements: list[MerchantSettlementOut]
    next_payout: int
    next_payout_date: str | None


class ShopUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    full_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_types: Optional[List[str]] = None
    avg_cooking_time: Optional[int] = None
    minimum_order: Optional[int] = None
    delivery_fee: Optional[int] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_account_name: Optional[str] = None
