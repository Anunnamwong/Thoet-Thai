import uuid
from datetime import datetime
from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    menu_item_id: uuid.UUID
    item_price: int
    quantity: int = 1
    selected_options: list[dict] = []
    special_note: str | None = None


class OrderCreate(BaseModel):
    shop_id: uuid.UUID
    items: list[OrderItemCreate]
    delivery_address: str
    delivery_latitude: float | None = None
    delivery_longitude: float | None = None
    delivery_note: str | None = None
    payment_method: str = "cod"  # cod | promptpay
    promo_code: str | None = None


class UpdateStatusRequest(BaseModel):
    status: str
    note: str | None = None
    prep_time_mins: int | None = None


class CancelRequest(BaseModel):
    reason: str = "ลูกค้ายกเลิก"


class OrderItemOut(BaseModel):
    id: uuid.UUID
    menu_item_id: uuid.UUID
    item_name: str
    item_price: int
    quantity: int
    selected_options: list[dict] = []
    special_note: str | None = None
    line_total: int

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_id: uuid.UUID
    shop_id: uuid.UUID
    rider_id: uuid.UUID | None = None
    status: str
    delivery_address: str
    delivery_note: str | None = None
    subtotal: int
    delivery_fee: int
    discount: int
    total: int
    payment_method: str
    payment_status: str
    items: list[OrderItemOut] = []
    estimated_ready_at: datetime | None = None
    rider_latitude: float | None = None
    rider_longitude: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListItem(BaseModel):
    id: uuid.UUID
    order_number: str
    shop_id: uuid.UUID
    shop_name: str | None = None
    status: str
    total: int
    payment_method: str
    payment_status: str
    item_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
