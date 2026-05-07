import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.database import async_session
from app.models.order import Order
from app.models.user import User
from app.services import rider as rider_svc

async def reproduce():
    async with async_session() as db:
        # 1. Find a rider
        rider_res = await db.execute(select(User).where(User.role == 'rider'))
        rider = rider_res.scalars().first()
        if not rider:
            print("No rider found")
            return

        # 2. Find an unassigned order
        order_res = await db.execute(select(Order).where(Order.rider_id.is_(None)))
        order = order_res.scalars().first()
        if not order:
            print("No unassigned order found")
            return

        print(f"Testing with Rider: {rider.display_name} ({rider.id})")
        print(f"Testing with Order: {order.order_number} ({order.id}) Status: {order.status}")

        try:
            # 3. Try to accept the job
            job = await rider_svc.accept_job(db, order.id, rider)
            await db.commit()
            print(f"Success! Job created: {job.id} Status: {job.status}")
        except Exception as e:
            print(f"Error accepting job: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(reproduce())
