# Feature Requirements — MVP (P0 Only)

## Scope
- 15 features total across 4 roles
- Target: 5 ร้าน, 3 ไรเดอร์, ~50 ลูกค้า ในตำบลเทอดไทย
- Timeline: 6-8 weeks for solo developer

---

## Customer App (4 features)

### C1: Browse ร้าน + เมนู
- List ร้านที่เปิดอยู่ พร้อมรูป ชื่อ ประเภท เวลาเปิด
- Search + filter ตามประเภทอาหาร
- หน้า detail ร้าน → เมนูแยกหมวดหมู่
- แสดง sold out / ร้านปิด ชัดเจน
- Empty state: "ยังไม่มีร้านในพื้นที่ — กำลังเพิ่มเร็วๆ นี้"

### C2: ตะกร้า + สั่งอาหาร
- เพิ่ม/ลบ/แก้จำนวน + ตัวเลือก (เผ็ด/ไม่เผ็ด)
- Note พิเศษต่อรายการ
- รวมราคา + ค่าส่ง + ส่วนลด breakdown ชัด
- เลือกที่อยู่จัดส่ง (saved address หรือ pin ใหม่)
- Validation: ร้านยังเปิดมั้ย + ของยังมีมั้ย ก่อน submit

### C3: ชำระเงิน
- PromptPay QR: generate QR + countdown 15 นาที + upload slip
- COD: confirm → ส่งออเดอร์เลย ไรเดอร์เก็บเงินปลายทาง
- MVP: manual verify โดย admin (auto Phase 2)
- Status: pending_payment → paid

### C4: Track ออเดอร์ Real-time
- Timeline 5 ขั้น: รับออเดอร์ → ร้านทำ → ไรเดอร์รับ → กำลังส่ง → ส่งแล้ว
- แผนที่แสดงตำแหน่งไรเดอร์ (update ทุก 10s)
- ETA โดยประมาณ
- ปุ่มแชท/โทรไรเดอร์ผ่าน LINE
- ยกเลิกได้เฉพาะก่อนร้านรับ

---

## Merchant App (4 features)

### M1: จัดการเมนู
- CRUD เมนู: ชื่อ, ราคา, รูป, หมวดหมู่, ตัวเลือก
- Toggle ของหมด/มีของ — ปุ่มใหญ่ กดง่าย
- ถ่ายรูปจากกล้องได้เลย (ไม่ใช่แค่ upload)
- UX: แม่ค้า 50+ ต้องใช้ได้ ปุ่มใหญ่ ตัวหนังสือใหญ่

### M2: รับออเดอร์
- Alert เต็มจอ เสียงดัง สั่น เมื่อมีออเดอร์ใหม่
- กด Accept → เลือกเวลาทำ (10/15/20/30 นาที)
- กด Reject → เลือกเหตุผล (ของหมด/ยุ่งมาก/ปิดแล้ว)
- Active orders list: กำลังทำ → พร้อมส่ง → ไรเดอร์รับแล้ว
- กด "ทำเสร็จแล้ว" → status เปลี่ยนเป็น ready_for_pickup

### M3: จัดการเวลาเปิด-ปิด
- Toggle เปิด/ปิดร้านที่หน้าแรก (กดปุ๊บเปลี่ยนปั๊บ)
- ตั้งเวลาต่อวัน (จ-อา)
- ปิดชั่วคราว vs ปิดทั้งวัน

### M4: รายได้ + Settlement
- Dashboard: ยอดวันนี้ / 7 วัน / 30 วัน
- รายการออเดอร์ + GP ที่หัก (10%)
- Settlement history: ครั้งต่อไป + ประวัติเก่า
- MVP: admin โอนเงิน manual + แนบ slip

---

## Rider App (4 features)

### R1: Online/Offline
- Toggle ใหญ่กลางจอ เปลี่ยนสีทั้งหน้า
- ส่ง GPS ทุก 10s เมื่อ online → Redis (TTL 30s)
- แสดงสถานะ: ออฟไลน์ / ว่าง / กำลังส่ง

### R2: รับงาน
- Full screen alert เมื่อมีงานใหม่
- แสดง: ร้าน, ที่ส่ง, ระยะทาง, ค่าตอบแทน
- Countdown 30 วินาที → timeout → ส่งให้คนถัดไป
- Accept / Reject ปุ่มใหญ่ ใช้มือเดียวได้

### R3: Navigation + Update สถานะ
- 4 ขั้นตอน กดปุ่มเดียวต่อขั้น:
  1. "ถึงร้านแล้ว"
  2. "รับของแล้ว"
  3. "ถึงที่ส่งแล้ว"
  4. "ส่งสำเร็จ" (+ ถ่ายรูป Phase 1.5)
- ปุ่ม Navigate ไป Google Maps เด่นสุดทุกหน้า
- แชทลูกค้าผ่าน LINE deep link

### R4: รายได้ไรเดอร์
- ยอดวันนี้ / สัปดาห์ / เดือน
- จำนวนงานสำเร็จ
- ยอดที่ยังไม่ได้รับ (pending settlement)
- ประวัติงานทั้งหมด

---

## Admin Panel (3 features)

### A1: จัดการร้าน + ไรเดอร์
- Approve queue: ร้าน/ไรเดอร์ใหม่รอ approve
- ดู KYC documents
- Suspend / Reactivate
- Search + filter

### A2: Monitor ออเดอร์ Real-time
- Live list ออเดอร์ทั้งหมด
- Filter: สถานะ, ร้าน, ไรเดอร์, ช่วงเวลา
- Highlight ออเดอร์ค้าง > 30 นาที (แดง)
- Manual: reassign ไรเดอร์, cancel, refund
- LINE Notify alert ไปหา admin เมื่อ stuck

### A3: Settlement + การเงิน
- สรุปยอดต้องจ่ายแต่ละร้าน/ไรเดอร์
- กด "จ่ายแล้ว" + แนบ slip
- Reconcile report
- Export Excel

---

## Production-Ready Pages

### Legal (ต้องมีก่อน launch)
- Terms of Service — ภาษาไทย
- Privacy Policy — PDPA 2562 compliant
- Refund & Cancellation Policy
- PDPA Consent at signup

### Support
- FAQ (searchable)
- Contact Us (LINE OA + phone)
- Report Problem (in-app)

### Error States
- 404 Not Found
- 500 Server Error
- Offline (cached cart)
- Maintenance Mode
- Geo-restriction (outside Thoet Thai)
- App version outdated

### Empty States (7 types)
- No shops nearby
- Empty cart
- No order history
- No active jobs (rider)
- No incoming orders (merchant)
- No search results
- No notifications

### Loading States
- Skeleton screens for all lists
- Spinner for button actions
- Progress bar for uploads

### Confirmation Modals
- Cancel order
- Delete menu item
- Reject order (merchant)
- Reject job (rider)
- Sign out
- Delete account
