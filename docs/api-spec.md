# API Specification — v1

Base URL: `/api/v1`
Auth: Bearer JWT in Authorization header (except public endpoints)
Response format: `{ success: bool, data: T | null, error: string | null, meta: object | null }`

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/line` | - | LINE LIFF token → JWT |
| POST | `/auth/admin/login` | - | Email + password → JWT (admin only) |
| POST | `/auth/refresh` | Refresh | Refresh access token |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| GET  | `/auth/me` | Yes | Get current user profile |

### POST /auth/line
```json
// Request
{ "liff_access_token": "xxx", "role": "customer" }
// Response
{ "access_token": "xxx", "refresh_token": "xxx", "user": { ... } }
```
- Creates user if first login
- Role determines which app they registered from

---

## Shops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/shops` | Yes | List shops (customer view) |
| GET | `/shops/:id` | Yes | Shop detail + hours |
| GET | `/shops/:id/menu` | Yes | Menu items grouped by category |
| POST | `/shops` | Merchant | Register new shop (pending approval) |
| PATCH | `/shops/:id` | Merchant | Update shop info |
| PATCH | `/shops/:id/toggle` | Merchant | Toggle open/close |

### GET /shops
```
Query: ?lat=20.xx&lng=99.xx&category=ข้าว&search=xxx&page=1&limit=20
Response: { shops: [...], meta: { page, total, has_next } }
```
- Only returns active + open shops for customer
- Ordered by distance if lat/lng provided

---

## Menu

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/shops/:id/menu` | Yes | Full menu with categories |
| POST | `/menu` | Merchant | Add menu item |
| PATCH | `/menu/:id` | Merchant | Update menu item |
| PATCH | `/menu/:id/availability` | Merchant | Toggle sold out |
| DELETE | `/menu/:id` | Merchant | Soft delete item |
| POST | `/menu/:id/image` | Merchant | Upload menu photo |

### POST /menu
```json
{
  "shop_id": "uuid",
  "category_id": "uuid",
  "name": "ข้าวผัดกระเพรา",
  "price": 45,
  "description": "ข้าวผัดกระเพราหมูสับ ไข่ดาว",
  "options": [
    {
      "name": "ระดับเผ็ด",
      "required": true,
      "choices": [
        { "label": "ไม่เผ็ด", "extra_price": 0 },
        { "label": "เผ็ดน้อย", "extra_price": 0 },
        { "label": "เผ็ดมาก", "extra_price": 0 }
      ]
    },
    {
      "name": "เพิ่มเติม",
      "required": false,
      "choices": [
        { "label": "ไข่ดาว", "extra_price": 10 },
        { "label": "ไข่เจียว", "extra_price": 15 }
      ]
    }
  ]
}
```

---

## Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Customer | Create new order |
| GET | `/orders` | Yes | List orders (filtered by role) |
| GET | `/orders/:id` | Yes | Order detail |
| PATCH | `/orders/:id/status` | Yes | Update status (role-specific) |
| POST | `/orders/:id/cancel` | Yes | Cancel order |

### POST /orders
```json
{
  "shop_id": "uuid",
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "selected_options": [
        { "name": "ระดับเผ็ด", "choice": "เผ็ดน้อย", "extra_price": 0 }
      ],
      "special_note": "ไม่ใส่ผัก"
    }
  ],
  "delivery_address": "123 หมู่ 4 ต.เทอดไทย",
  "delivery_latitude": 20.xxx,
  "delivery_longitude": 99.xxx,
  "delivery_note": "บ้านหลังคาแดง ข้างวัด",
  "payment_method": "cod",
  "promo_code": "FIRST50"
}
```

### PATCH /orders/:id/status
```json
// Merchant accepts
{ "status": "preparing", "cooking_time": 15 }
// Merchant ready
{ "status": "ready_for_pickup" }
// Rider picked up
{ "status": "picked_up" }
// Rider delivered
{ "status": "delivered", "proof_image_url": "https://..." }
```

### Status transition rules:
```
Customer:  pending_payment → cancel
           paid → cancel (before merchant accepts)
Merchant:  paid → preparing (accept)
           paid → cancelled (reject, with reason)
           preparing → ready_for_pickup
System:    ready_for_pickup → rider_assigned (dispatch)
Rider:     rider_assigned → picked_up
           picked_up → delivered
Admin:     any → any (override)
```

---

## Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/promptpay` | Customer | Generate PromptPay QR |
| POST | `/payments/:id/verify` | Admin | Verify payment manually |
| POST | `/payments/:id/slip` | Customer | Upload payment slip |

### POST /payments/promptpay
```json
// Request
{ "order_id": "uuid" }
// Response
{ "payment_id": "uuid", "qr_payload": "00020101...", "amount": 195, "expires_at": "..." }
```

---

## Riders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/riders/status` | Rider | Toggle online/offline |
| PATCH | `/riders/location` | Rider | Update GPS position |
| GET | `/riders/current-job` | Rider | Get active delivery job |
| POST | `/riders/jobs/:id/accept` | Rider | Accept delivery job |
| POST | `/riders/jobs/:id/reject` | Rider | Reject delivery job |
| PATCH | `/riders/jobs/:id/status` | Rider | Update job status |
| GET | `/riders/earnings` | Rider | Earnings summary |
| GET | `/riders/history` | Rider | Delivery history |

### PATCH /riders/location
```json
{ "latitude": 20.xxx, "longitude": 99.xxx }
```
- Called every 10s when rider is online
- Stored in Redis with 30s TTL

---

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/orders` | Admin | All orders (filterable) |
| PATCH | `/admin/orders/:id` | Admin | Override order (reassign, cancel, refund) |
| GET | `/admin/merchants` | Admin | Merchant list + approval queue |
| PATCH | `/admin/merchants/:id/approve` | Admin | Approve merchant |
| PATCH | `/admin/merchants/:id/suspend` | Admin | Suspend merchant |
| GET | `/admin/riders` | Admin | Rider list + approval queue |
| PATCH | `/admin/riders/:id/approve` | Admin | Approve rider |
| GET | `/admin/settlements` | Admin | Settlement queue |
| POST | `/admin/settlements/:id/pay` | Admin | Mark settlement as paid |
| GET | `/admin/dashboard` | Admin | Live stats |

### GET /admin/dashboard
```json
{
  "today": {
    "total_orders": 45,
    "active_orders": 8,
    "completed_orders": 35,
    "cancelled_orders": 2,
    "gmv": 12500,
    "commission_earned": 1250
  },
  "active_riders": 5,
  "open_shops": 12,
  "stuck_orders": [ /* orders > 30min without status change */ ]
}
```

---

## Realtime (Supabase)

Subscribe to these channels from frontend:

| Channel | Table | Filter | Consumer |
|---------|-------|--------|----------|
| Order updates | `orders` | `customer_id = me` | Customer |
| New orders | `orders` | `shop_id = my_shop` | Merchant |
| Job assignments | `delivery_jobs` | `rider_id = me` | Rider |
| Rider location | Redis pub/sub | `order_id = X` | Customer (tracking) |
| All orders | `orders` | none | Admin |

---

## Error Codes

| Code | HTTP | Thai Message |
|------|------|-------------|
| SHOP_CLOSED | 400 | ร้านปิดอยู่ครับ |
| ITEM_UNAVAILABLE | 400 | รายการนี้หมดแล้วครับ |
| ORDER_CANNOT_CANCEL | 400 | ไม่สามารถยกเลิกได้ เพราะร้านกำลังทำอาหารแล้ว |
| RIDER_NOT_AVAILABLE | 400 | ไม่มีไรเดอร์ว่างตอนนี้ กรุณารอสักครู่ |
| PAYMENT_EXPIRED | 400 | QR หมดอายุแล้ว กรุณาสร้างใหม่ |
| UNAUTHORIZED | 401 | กรุณาเข้าสู่ระบบใหม่ |
| FORBIDDEN | 403 | คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ |
| NOT_FOUND | 404 | ไม่พบข้อมูลที่ต้องการ |
| PROMO_INVALID | 400 | โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว |
| MIN_ORDER | 400 | ยอดสั่งซื้อขั้นต่ำ ฿{amount} |
