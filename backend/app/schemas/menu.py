from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List


class MenuChoiceSchema(BaseModel):
    label: str
    extra_price: int = 0


class MenuOptionSchema(BaseModel):
    name: str
    required: bool = False
    choices: List[MenuChoiceSchema] = []


class MenuItemSchema(BaseModel):
    id: UUID
    shop_id: UUID
    category_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    is_available: bool
    sort_order: int
    options: List[MenuOptionSchema] = []

    model_config = {"from_attributes": True}


class MenuCategorySchema(BaseModel):
    id: Optional[UUID] = None
    shop_id: UUID
    name: str
    sort_order: int
    items: List[MenuItemSchema] = []

    model_config = {"from_attributes": True}


class MenuCategoryCreate(BaseModel):
    shop_id: UUID
    name: str
    sort_order: int = 0


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None


class MenuItemCreate(BaseModel):
    shop_id: UUID
    category_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    options: List[MenuOptionSchema] = []


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    category_id: Optional[UUID] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    options: Optional[List[MenuOptionSchema]] = None
