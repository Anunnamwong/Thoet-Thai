from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    pdpa_consent_at: Optional[datetime] = None


class AddressBase(BaseModel):
    label: str = "บ้าน"
    full_address: str
    house_number: Optional[str] = None
    moo: Optional[str] = None
    soi: Optional[str] = None
    road: Optional[str] = None
    subdistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    note: Optional[str] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    full_address: Optional[str] = None
    house_number: Optional[str] = None
    moo: Optional[str] = None
    soi: Optional[str] = None
    road: Optional[str] = None
    subdistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    note: Optional[str] = None
    is_default: Optional[bool] = None


class AddressOut(AddressBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
