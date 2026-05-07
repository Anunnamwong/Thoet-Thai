"""Run: python clear_orders.py"""
import asyncio
from sqlalchemy import text
from app.core.database import async_session


async def main():
    async with async_session() as db:
        await db.execute(text("DELETE FROM audit_logs"))
        await db.execute(text("DELETE FROM notifications"))
        await db.execute(text("DELETE FROM payments"))
        await db.execute(text("DELETE FROM settlements"))
        await db.execute(text("DELETE FROM delivery_jobs"))
        await db.execute(text("DELETE FROM order_items"))
        await db.execute(text("DELETE FROM orders"))
        await db.commit()
        print("Done — all order-related data cleared, shops/menus/users/addresses untouched.")


asyncio.run(main())
