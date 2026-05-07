-- ============================================================
-- Database Schema: Hyperlocal Food Delivery App
-- PostgreSQL 15 + PostGIS
-- ============================================================
-- Design principles:
--   1. UUIDs for all PKs (external exposure safe)
--   2. Soft delete (deleted_at) on user-facing tables
--   3. JSONB for extensible attributes (future-proof)
--   4. Audit fields (created_at, updated_at) everywhere
--   5. PostGIS-ready for geo queries (Phase 2+)
--   6. Indexes on FKs + frequent query columns
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";        -- for geo queries later

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'rider', 'admin');
CREATE TYPE order_status AS ENUM (
  'pending_payment',   -- ลูกค้าสั่งแล้ว ยังไม่จ่าย
  'paid',              -- จ่ายแล้ว รอร้านรับ
  'preparing',         -- ร้านกำลังทำ
  'ready_for_pickup',  -- ร้านทำเสร็จ รอไรเดอร์
  'rider_assigned',    -- ไรเดอร์รับงานแล้ว
  'picked_up',         -- ไรเดอร์รับของแล้ว
  'delivered',         -- ส่งเสร็จ
  'cancelled',         -- ยกเลิก
  'refunded'           -- คืนเงินแล้ว
);
CREATE TYPE payment_method AS ENUM ('promptpay', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'refunded');
CREATE TYPE rider_status AS ENUM ('offline', 'online', 'on_job');
CREATE TYPE shop_status AS ENUM ('pending_approval', 'active', 'suspended', 'closed');
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed');
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

-- ============================================================
-- USERS (ทุก role ใช้ตารางเดียว)
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id  VARCHAR(255) UNIQUE,          -- LINE UID from LIFF
  phone         VARCHAR(20) UNIQUE,
  display_name  VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  email         VARCHAR(255),                  -- admin only
  password_hash VARCHAR(255),                  -- admin only (bcrypt)
  role          user_role NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  metadata      JSONB DEFAULT '{}',            -- extensible profile data
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ                    -- soft delete
);

CREATE INDEX idx_users_line_uid ON users(line_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- ============================================================
-- ADDRESSES (ที่อยู่ลูกค้า — รองรับหลายที่อยู่)
-- ============================================================

CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  label         VARCHAR(50) NOT NULL DEFAULT 'บ้าน',  -- บ้าน, ที่ทำงาน, etc.
  full_address  TEXT NOT NULL,
  house_number  VARCHAR(50),
  moo           VARCHAR(20),         -- หมู่
  soi           VARCHAR(100),        -- ซอย
  road          VARCHAR(100),        -- ถนน
  subdistrict   VARCHAR(100),        -- ตำบล
  district      VARCHAR(100),        -- อำเภอ
  province      VARCHAR(100),        -- จังหวัด
  postal_code   VARCHAR(10),
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  note          TEXT,                 -- จุดสังเกต
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================================
-- SHOPS (ร้านค้า)
-- ============================================================

CREATE TABLE shops (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES users(id),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  cover_image_url   TEXT,
  phone             VARCHAR(20),
  status            shop_status NOT NULL DEFAULT 'pending_approval',
  is_open           BOOLEAN NOT NULL DEFAULT false,    -- toggle เปิด/ปิดร้าน
  -- Address
  full_address      TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  -- Business info
  cuisine_types     TEXT[] DEFAULT '{}',               -- ประเภทอาหาร tags
  avg_cooking_time  INTEGER DEFAULT 15,                -- นาที
  minimum_order     INTEGER DEFAULT 0,                 -- บาท
  delivery_fee      INTEGER DEFAULT 15,                -- บาท (zone-based later)
  commission_rate   DECIMAL(5,2) DEFAULT 10.00,        -- GP %
  -- Banking
  bank_name         VARCHAR(100),
  bank_account      VARCHAR(50),
  bank_account_name VARCHAR(255),
  -- KYC
  kyc_document_url  TEXT,
  approved_at       TIMESTAMPTZ,
  approved_by       UUID REFERENCES users(id),
  -- Extensible
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_shops_owner ON shops(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_status ON shops(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shops_location ON shops(latitude, longitude) WHERE deleted_at IS NULL;

-- ============================================================
-- SHOP HOURS (เวลาเปิด-ปิดร้าน)
-- ============================================================

CREATE TABLE shop_hours (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  day         day_of_week NOT NULL,
  open_time   TIME NOT NULL,          -- 08:00
  close_time  TIME NOT NULL,          -- 20:00
  is_closed   BOOLEAN DEFAULT false,  -- วันหยุดพิเศษ
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, day)
);

CREATE INDEX idx_shop_hours_shop ON shop_hours(shop_id);

-- ============================================================
-- MENU CATEGORIES (หมวดหมู่เมนู)
-- ============================================================

CREATE TABLE menu_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,    -- ข้าว, ก๋วยเตี๋ยว, เครื่องดื่ม
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_categories_shop ON menu_categories(shop_id);

-- ============================================================
-- MENU ITEMS (รายการอาหาร)
-- ============================================================

CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL,              -- บาท (integer = no rounding issues)
  image_url     TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT true,  -- sold out toggle
  sort_order    INTEGER DEFAULT 0,
  -- Options stored as JSONB for flexibility
  -- format: [{ "name": "ระดับเผ็ด", "required": true,
  --            "choices": [{"label":"ไม่เผ็ด","extra_price":0}, ...] }]
  options       JSONB DEFAULT '[]',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_menu_items_shop ON menu_items(shop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_category ON menu_items(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_available ON menu_items(shop_id, is_available) WHERE deleted_at IS NULL;

-- ============================================================
-- ORDERS (คำสั่งซื้อ)
-- ============================================================

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(20) NOT NULL UNIQUE,    -- human-readable: GK-240101-001
  customer_id         UUID NOT NULL REFERENCES users(id),
  shop_id             UUID NOT NULL REFERENCES shops(id),
  rider_id            UUID REFERENCES users(id),
  -- Status
  status              order_status NOT NULL DEFAULT 'pending_payment',
  status_history      JSONB DEFAULT '[]',  -- [{status, timestamp, note}]
  -- Address (snapshot — don't FK to addresses table)
  delivery_address    TEXT NOT NULL,
  delivery_latitude   DOUBLE PRECISION,
  delivery_longitude  DOUBLE PRECISION,
  delivery_note       TEXT,
  -- Pricing
  subtotal            INTEGER NOT NULL,     -- รวมราคาอาหาร
  delivery_fee        INTEGER NOT NULL,     -- ค่าส่ง
  discount            INTEGER DEFAULT 0,    -- ส่วนลด
  total               INTEGER NOT NULL,     -- ยอดรวมสุทธิ
  -- Payment
  payment_method      payment_method NOT NULL DEFAULT 'cod',
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  -- Timing
  cooking_time        INTEGER,              -- นาทีที่ร้านบอก
  estimated_delivery  TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       TEXT,
  -- Promo
  promo_code          VARCHAR(50),
  -- Extensible
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================================
-- ORDER ITEMS (รายการอาหารในออเดอร์)
-- ============================================================

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id),
  -- Snapshot at time of order (prices may change later)
  item_name       VARCHAR(255) NOT NULL,
  item_price      INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  -- Selected options snapshot
  selected_options JSONB DEFAULT '[]',  -- [{name, choice, extra_price}]
  special_note    TEXT,                  -- "ไม่ใส่ผัก"
  line_total      INTEGER NOT NULL,     -- (item_price + extras) * quantity
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- PAYMENTS (การชำระเงิน)
-- ============================================================

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  method          payment_method NOT NULL,
  amount          INTEGER NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  -- PromptPay
  promptpay_ref   VARCHAR(50),       -- reference from PromptPay
  qr_payload      TEXT,              -- QR string
  -- Verification
  verified_by     UUID REFERENCES users(id),  -- admin who verified
  verified_at     TIMESTAMPTZ,
  slip_image_url  TEXT,              -- uploaded payment slip
  -- COD
  collected_by    UUID REFERENCES users(id),  -- rider who collected cash
  collected_at    TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- RIDER PROFILES (ข้อมูลเพิ่มเติมไรเดอร์)
-- ============================================================

CREATE TABLE rider_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id),
  status            rider_status NOT NULL DEFAULT 'offline',
  -- Vehicle
  vehicle_type      VARCHAR(50) DEFAULT 'motorcycle',  -- motorcycle, bicycle
  license_plate     VARCHAR(20),
  -- Location (current)
  current_latitude  DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  last_location_at  TIMESTAMPTZ,
  -- KYC
  id_card_url       TEXT,
  driving_license_url TEXT,
  vehicle_photo_url TEXT,
  approved_at       TIMESTAMPTZ,
  approved_by       UUID REFERENCES users(id),
  -- Banking
  bank_name         VARCHAR(100),
  bank_account      VARCHAR(50),
  bank_account_name VARCHAR(255),
  -- Stats
  total_deliveries  INTEGER DEFAULT 0,
  total_earnings    INTEGER DEFAULT 0,    -- สะสม (บาท)
  -- Extensible
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rider_profiles_user ON rider_profiles(user_id);
CREATE INDEX idx_rider_profiles_status ON rider_profiles(status);
CREATE INDEX idx_rider_profiles_location ON rider_profiles(current_latitude, current_longitude)
  WHERE status = 'online';

-- ============================================================
-- DELIVERY JOBS (งานส่งของ — 1 order = 1 job)
-- ============================================================

CREATE TABLE delivery_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  rider_id        UUID REFERENCES users(id),
  -- Status tracking
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, assigned, at_shop, picked_up, at_customer, delivered, cancelled
  assigned_at     TIMESTAMPTZ,
  arrived_shop_at TIMESTAMPTZ,
  picked_up_at    TIMESTAMPTZ,
  arrived_customer_at TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  -- Proof
  proof_image_url TEXT,              -- ถ่ายรูปยืนยันส่ง
  -- Earnings
  delivery_fee    INTEGER NOT NULL,  -- ค่าส่งที่ไรเดอร์ได้
  tip             INTEGER DEFAULT 0,
  -- Dispatch
  dispatch_attempts INTEGER DEFAULT 0,
  rejected_by     UUID[] DEFAULT '{}',  -- riders who rejected
  timeout_at      TIMESTAMPTZ,          -- 30s countdown
  -- Distance
  distance_km     DECIMAL(5,2),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_jobs_order ON delivery_jobs(order_id);
CREATE INDEX idx_delivery_jobs_rider ON delivery_jobs(rider_id);
CREATE INDEX idx_delivery_jobs_status ON delivery_jobs(status);

-- ============================================================
-- SETTLEMENTS (การจ่ายเงินให้ร้าน/ไรเดอร์)
-- ============================================================

CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id    UUID NOT NULL REFERENCES users(id),
  recipient_type  user_role NOT NULL,         -- 'merchant' or 'rider'
  -- Period
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  -- Amounts
  gross_amount    INTEGER NOT NULL,            -- ยอดรวมก่อนหัก
  commission      INTEGER NOT NULL DEFAULT 0,  -- GP ที่หัก (merchant only)
  net_amount      INTEGER NOT NULL,            -- ยอดจ่ายจริง
  -- Status
  status          settlement_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  paid_by         UUID REFERENCES users(id),   -- admin who approved
  transfer_slip   TEXT,                         -- slip image URL
  bank_ref        VARCHAR(100),
  -- Related orders
  order_ids       UUID[] DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_recipient ON settlements(recipient_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_period ON settlements(period_start, period_end);

-- ============================================================
-- PROMOTIONS (โปรโมชัน — P1 but schema ready)
-- ============================================================

CREATE TABLE promotions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(50) NOT NULL UNIQUE,
  description     TEXT,
  -- Rules (JSONB for flexibility)
  -- { "type": "fixed"|"percent", "value": 50, "min_order": 100,
  --   "max_discount": 50, "max_uses": 100, "per_user_limit": 1 }
  rules           JSONB NOT NULL DEFAULT '{}',
  -- Validity
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  -- Usage tracking
  total_used      INTEGER DEFAULT 0,
  created_by      UUID REFERENCES users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_code ON promotions(code) WHERE is_active = true;

-- ============================================================
-- NOTIFICATIONS (แจ้งเตือน — stored for history)
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  type        VARCHAR(50) NOT NULL,     -- order_update, promotion, system
  data        JSONB DEFAULT '{}',       -- {order_id, action_url, ...}
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- AUDIT LOG (สำหรับ admin — track การเปลี่ยนแปลงสำคัญ)
-- ============================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,    -- order.cancel, shop.approve, etc.
  entity_type VARCHAR(50) NOT NULL,     -- order, shop, rider, etc.
  entity_id   UUID NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_updated_at_%I
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate order number: GK-YYMMDD-NNN
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
  date_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  NEW.order_number := 'GK-' || date_part || '-' || LPAD(today_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();
