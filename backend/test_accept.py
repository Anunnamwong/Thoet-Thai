import httpx
import uuid

BASE = "http://localhost:8000/api/v1"

def test():
    # 1. Login as customer and create order
    r = httpx.post(f"{BASE}/auth/dev-login", json={"role": "customer"})
    ctoken = r.json()["data"]["access_token"]
    ch = {"Authorization": f"Bearer {ctoken}"}
    
    shops = httpx.get(f"{BASE}/shops", headers=ch).json()["data"]
    shop_id = shops[0]["id"]
    menu = httpx.get(f"{BASE}/shops/{shop_id}/menu", headers=ch).json()["data"]
    item = menu[0]["items"][0]
    
    r = httpx.post(f"{BASE}/orders", headers=ch, json={
        "shop_id": shop_id,
        "items": [{"menu_item_id": item["id"], "quantity": 1, "item_price": item["price"]}],
        "delivery_address": "Test Address",
        "payment_method": "cod",
    })
    order_id = r.json()["data"]["id"]
    print(f"Created Order: {order_id}")
    
    # 2. Login as merchant and set to ready_for_pickup
    r = httpx.post(f"{BASE}/auth/dev-login", json={"role": "merchant"})
    mtoken = r.json()["data"]["access_token"]
    mh = {"Authorization": f"Bearer {mtoken}"}
    
    httpx.patch(f"{BASE}/orders/{order_id}/status", headers=mh, json={"status": "preparing"})
    httpx.patch(f"{BASE}/orders/{order_id}/status", headers=mh, json={"status": "ready_for_pickup"})
    print("Order is now ready_for_pickup")
    
    # 3. Login as rider and accept
    r = httpx.post(f"{BASE}/auth/dev-login", json={"role": "rider"})
    rtoken = r.json()["data"]["access_token"]
    rh = {"Authorization": f"Bearer {rtoken}"}
    
    print(f"Rider attempting to accept Order ID: {order_id}")
    try:
        r = httpx.post(f"{BASE}/riders/jobs/{order_id}/accept", headers=rh)
        print(f"Status Code: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
