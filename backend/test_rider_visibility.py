"""Test rider sees order across all pre-assignment statuses."""
import asyncio, httpx
from sqlalchemy import text
from app.core.database import async_session

BASE = "http://localhost:8000/api/v1"

def login(role):
    return httpx.post(f"{BASE}/auth/dev-login", json={"role": role}).json()["data"]["access_token"]

def H(t):
    return {"Authorization": f"Bearer {t}"}

async def clear():
    async with async_session() as db:
        for table in ["delivery_jobs", "order_items", "orders"]:
            await db.execute(text(f"DELETE FROM {table}"))
        await db.commit()

asyncio.run(clear())

ct = login("customer")
mt = login("merchant")
rt = login("rider")

shop = httpx.get(f"{BASE}/shops", headers=H(ct)).json()["data"][0]
item = httpx.get(f"{BASE}/shops/{shop['id']}/menu", headers=H(ct)).json()["data"][0]["items"][0]

o = httpx.post(f"{BASE}/orders", headers=H(ct), json={
    "shop_id": shop["id"],
    "items": [{"menu_item_id": item["id"], "quantity": 1}],
    "delivery_address": "test",
    "payment_method": "cod",
}).json()["data"]
oid = o["id"]

httpx.patch(f"{BASE}/riders/status", headers=H(rt), json={"status": "online"})

def check(label):
    count = len(httpx.get(f"{BASE}/orders", headers=H(rt)).json()["data"])
    result = "OK" if count >= 1 else "FAIL -- rider cannot see order!"
    print(f"  [{label:20s}] rider sees {count} order -> {result}")

check("paid")
httpx.patch(f"{BASE}/orders/{oid}/status", headers=H(mt), json={"status": "preparing"})
check("preparing")
httpx.patch(f"{BASE}/orders/{oid}/status", headers=H(mt), json={"status": "ready_for_pickup"})
check("ready_for_pickup")
httpx.post(f"{BASE}/riders/jobs/{oid}/accept", headers=H(rt))
check("rider_assigned")

print("\nAll checks done.")
