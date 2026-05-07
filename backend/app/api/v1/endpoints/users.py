import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.address import Address
from app.schemas.user import UserUpdate, AddressCreate, AddressUpdate, AddressOut
from app.schemas.auth import UserOut
from app.schemas.common import ApiResponse, ok

router = APIRouter()


@router.patch("/me", response_model=ApiResponse[UserOut])
async def update_profile(
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    await db.flush()
    await db.refresh(current_user)
    return ok(data=UserOut.model_validate(current_user))


@router.get("/me/addresses", response_model=ApiResponse[list[AddressOut]])
async def list_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    addresses = result.scalars().all()
    return ok(data=[AddressOut.model_validate(a) for a in addresses])


@router.post("/me/addresses", response_model=ApiResponse[AddressOut], status_code=201)
async def create_address(
    data: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # If this is set to default, unset others
    if data.is_default:
        await db.execute(
            update(Address)
            .where(Address.user_id == current_user.id)
            .values(is_default=False)
        )

    address = Address(
        user_id=current_user.id,
        **data.model_dump()
    )
    db.add(address)
    await db.flush()
    await db.refresh(address)
    return ok(data=AddressOut.model_validate(address))


@router.patch("/me/addresses/{address_id}", response_model=ApiResponse[AddressOut])
async def update_address(
    address_id: uuid.UUID,
    data: AddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(404, detail="ไม่พบที่อยู่")

    if data.is_default:
        await db.execute(
            update(Address)
            .where(Address.user_id == current_user.id)
            .values(is_default=False)
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(address, field, value)
    
    await db.flush()
    await db.refresh(address)
    return ok(data=AddressOut.model_validate(address))


@router.delete("/me/addresses/{address_id}", response_model=ApiResponse[dict])
async def delete_address(
    address_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(404, detail="ไม่พบที่อยู่")

    await db.delete(address)
    await db.flush()
    return ok(data={"deleted": True})
