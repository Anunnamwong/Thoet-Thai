from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.models.user import User
from sqlalchemy import select
from app.core.config import get_settings
from app.schemas.auth import (
    LineLoginRequest, AdminLoginRequest, DevLoginRequest, RefreshRequest,
    TokenResponse, UserOut,
)
from app.core.security import create_access_token, create_refresh_token
from app.schemas.common import ApiResponse, ok
from app.services import auth as auth_svc

router = APIRouter()

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    settings = get_settings()
    # Access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.jwt_access_expire_minutes * 60,
        samesite="lax",
        secure=not settings.debug,
    )
    # Refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.jwt_refresh_expire_days * 24 * 60 * 60,
        samesite="lax",
        secure=not settings.debug,
    )

@router.post("/line", response_model=ApiResponse[TokenResponse])
async def line_login(response: Response, data: LineLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, access_token, refresh_token = await auth_svc.line_login(
            db, data.liff_access_token, data.role
        )
        set_auth_cookies(response, access_token, refresh_token)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    return ok(data=TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    ))


@router.post("/admin/login", response_model=ApiResponse[TokenResponse])
async def admin_login(response: Response, data: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, access_token, refresh_token = await auth_svc.admin_login(
            db, data.email, data.password
        )
        set_auth_cookies(response, access_token, refresh_token)
    except ValueError as e:
        raise HTTPException(401, detail=str(e))
    return ok(data=TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    ))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh(
    response: Response,
    request: Request,
    data: RefreshRequest | None = None,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = None
    if data and data.refresh_token:
        refresh_token = data.refresh_token
    else:
        refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(401, detail="Refresh token missing")

    try:
        user, access_token, new_refresh = await auth_svc.refresh_tokens(
            db, refresh_token
        )
        set_auth_cookies(response, access_token, new_refresh)
    except ValueError as e:
        raise HTTPException(401, detail=str(e))
    return ok(data=TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserOut.model_validate(user),
    ))


@router.post("/dev-login", response_model=ApiResponse[TokenResponse])
async def dev_login(response: Response, data: DevLoginRequest, db: AsyncSession = Depends(get_db)):
    if not get_settings().debug:
        raise HTTPException(404, detail="Not found")
    result = await db.execute(
        select(User).where(
            User.role == data.role,
            User.is_active.is_(True),
            User.deleted_at.is_(None),
        ).limit(1)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, detail=f"ไม่พบ test user role={data.role} — รัน seed.py ก่อน")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})
    
    set_auth_cookies(response, access_token, refresh_token)
    
    return ok(data=TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    ))

@router.post("/logout", response_model=ApiResponse[dict])
async def logout(response: Response):
    settings = get_settings()
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=not settings.debug,
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        samesite="lax",
        secure=not settings.debug,
    )
    return ok(data={"message": "Logged out"})


@router.get("/me", response_model=ApiResponse[UserOut])
async def get_me(current_user: User = Depends(get_current_user)):
    return ok(data=UserOut.model_validate(current_user))
