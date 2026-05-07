import uuid
from datetime import datetime
from pydantic import BaseModel


class LineLoginRequest(BaseModel):
    liff_access_token: str
    role: str = "customer"


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class DevLoginRequest(BaseModel):
    role: str  # customer | merchant | rider | admin


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: uuid.UUID
    display_name: str
    role: str
    avatar_url: str | None = None
    phone: str | None = None
    email: str | None = None
    pdpa_consent_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
