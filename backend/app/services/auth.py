import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.core.config import get_settings

settings = get_settings()


async def line_login(db: AsyncSession, liff_access_token: str, role: str) -> tuple[User, str, str]:
    """Verify LINE token, upsert user, return (user, access_token, refresh_token)."""
    # Verify token with LINE API
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.line.me/v2/profile",
            headers={"Authorization": f"Bearer {liff_access_token}"},
            timeout=10,
        )
    if resp.status_code != 200:
        raise ValueError("LINE token ไม่ถูกต้องหรือหมดอายุ")

    profile = resp.json()
    line_user_id = profile["userId"]
    display_name = profile.get("displayName", "ผู้ใช้งาน")
    avatar_url = profile.get("pictureUrl")

    # Upsert user
    result = await db.execute(
        select(User).where(User.line_user_id == line_user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()

    if user:
        user.display_name = display_name
        if avatar_url:
            user.avatar_url = avatar_url
    else:
        user = User(
            line_user_id=line_user_id,
            display_name=display_name,
            avatar_url=avatar_url,
            role=role,
        )
        db.add(user)

    await db.flush()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})
    return user, access_token, refresh_token


async def admin_login(db: AsyncSession, email: str, password: str) -> tuple[User, str, str]:
    """Email/password login for admin users."""
    result = await db.execute(
        select(User).where(
            User.email == email,
            User.role == "admin",
            User.deleted_at.is_(None),
        )
    )
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        raise ValueError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")

    if not user.is_active:
        raise ValueError("บัญชีนี้ถูกระงับการใช้งาน")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})
    return user, access_token, refresh_token


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> tuple[User, str, str]:
    """Issue new token pair from a valid refresh token."""
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise ValueError("Refresh token ไม่ถูกต้องหรือหมดอายุ")

    result = await db.execute(
        select(User).where(User.id == payload["sub"], User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise ValueError("ไม่พบผู้ใช้งาน")

    new_access = create_access_token({"sub": str(user.id), "role": user.role})
    new_refresh = create_refresh_token({"sub": str(user.id), "role": user.role})
    return user, new_access, new_refresh
