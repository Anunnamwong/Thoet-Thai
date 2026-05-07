"""Full order flow test: customer → merchant → rider"""
import httpx, sys

BASE = "http://localhost:8000/api/v1"
OK = "[OK]"; FAIL = "[FAIL]"

def check(label: str, r: httpx.Response, expected: int = 200) -> dict:
    data = r.json()
    icon = OK if r.status_code == expected else FAIL
    print(f"{icon} [{r.status_code}] {label}")
    if r.status_code != expected:
        print(f"   → {data}")
        sys.exit(1)
    return data

def auth(role: str) -> str:
    r = httpx.post(f"{BASE}/auth/dev-login", json={"role": role})
    d = check(f"login as {role}", r)
    name = d["data"]["user"]["display_name"]
    print(f"   → {name}")
    return d["data"]["access_token"]

def H(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

print("\n--- Step 1: Customer login ---")
ct = auth("customer")

print("\n--- Step 2: Get shop + menu ---")
shops = check("list shops", httpx.get(f"{BASE}/shops", headers=H(ct)))
shop = shops["data"][0]
print(f"   → {shop['name']} | open={shop['is_open']}")

menu = check("get menu", httpx.get(f"{BASE}/shops/{shop['id']}/menu", headers=H(ct)))
first_cat = menu["data"][0]
item = first_cat["items"][0]
print(f"   → item: {item['name']} ฿{item['price']}")

print("\n--- Step 3: Create order ---")
r = httpx.post(f"{BASE}/orders", headers=H(ct), json={
    "shop_id": shop["id"],
    "items": [{"menu_item_id": item["id"], "quantity": 1, "item_price": item["price"]}],
    "delivery_address": "123 หมู่ 1 ต.เทอดไทย",
    "payment_method": "cod",
})
order = check("create order", r, 201)["data"]
order_id = order["id"]
print(f"   → {order['order_number']} | status={order['status']} | total=฿{order['total']}")

print("\n--- Step 4: Merchant accepts ---")
mt = auth("merchant")

r = httpx.patch(f"{BASE}/orders/{order_id}/status", headers=H(mt), json={"status": "preparing"})
d = check("merchant → preparing", r)
print(f"   → status={d['data']['status']}")

r = httpx.patch(f"{BASE}/orders/{order_id}/status", headers=H(mt), json={"status": "ready_for_pickup"})
d = check("merchant → ready_for_pickup", r)
print(f"   → status={d['data']['status']}")

print("\n--- Step 5: Rider accepts ---")
rt = auth("rider")

r = httpx.patch(f"{BASE}/riders/status", headers=H(rt), json={"status": "online"})
check("rider → online", r)

r = httpx.get(f"{BASE}/orders", headers=H(rt))
orders = check("rider list orders", r)["data"]
print(f"   → sees {len(orders)} order(s)")

# Accept by order_id (broadcast model)
r = httpx.post(f"{BASE}/riders/jobs/{order_id}/accept", headers=H(rt))
job = check("rider accept job", r)["data"]
print(f"   → job id={job['id']} | status={job['status']}")

print("\n--- Step 6: Rider picks up ---")
job_id = job["id"]
r = httpx.patch(f"{BASE}/riders/jobs/{job_id}/status", headers=H(rt), json={"status": "picked_up"})
job = check("rider → picked_up", r)["data"]
print(f"   → status={job['status']}")

print("\n--- Step 7: Rider delivers ---")
r = httpx.patch(f"{BASE}/riders/jobs/{job_id}/status", headers=H(rt), json={"status": "delivered"})
job = check("rider → delivered", r)["data"]
print(f"   → status={job['status']}")

print("\n--- Step 8: Verify final state ---")
r = httpx.get(f"{BASE}/orders/{order_id}", headers=H(ct))
final = check("customer get order", r)["data"]
print(f"   → status={final['status']} | payment_status={final['payment_status']}")

print(f"\n{OK} Full flow passed!\n")

