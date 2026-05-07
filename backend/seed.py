"""
Seed script for development data.
Usage: cd backend && python seed.py
"""
import asyncio
import uuid
from datetime import datetime, timezone, time, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.user import User
from app.models.shop import Shop, ShopHours
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem
from app.models.rider import RiderProfile, DeliveryJob

settings = get_settings()
engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


async def clear_tables(db: AsyncSession):
    for table in [
        "delivery_jobs", "order_items", "orders", "menu_items",
        "menu_categories", "shop_hours", "shops", "rider_profiles", "users",
    ]:
        await db.execute(text(f'DELETE FROM {table}'))
    await db.commit()
    print("Cleared existing data.")


async def seed(db: AsyncSession):
    now = datetime.now(timezone.utc)

    # ─── Admin ───────────────────────────────────────────────────────────────
    admin = User(
        id=uuid.uuid4(),
        display_name="Admin",
        email="admin@thoetthai.com",
        password_hash=hash_password("admin1234"),
        role="admin",
        is_active=True,
        pdpa_consent_at=now,
    )
    db.add(admin)

    # ─── Customer ────────────────────────────────────────────────────────────
    customer = User(
        id=uuid.uuid4(),
        display_name="สมหญิง ใจดี",
        phone="0812345678",
        line_user_id="Udev_customer_001",
        role="customer",
        is_active=True,
        pdpa_consent_at=now,
    )
    db.add(customer)

    # ─── Merchant users ──────────────────────────────────────────────────────
    m1 = User(id=uuid.uuid4(), display_name="ป้าหล้า", phone="0811111111",
               line_user_id="Udev_merchant_001", role="merchant", is_active=True, pdpa_consent_at=now)
    m2 = User(id=uuid.uuid4(), display_name="พ่อต้อย", phone="0822222222",
               line_user_id="Udev_merchant_002", role="merchant", is_active=True, pdpa_consent_at=now)
    m3 = User(id=uuid.uuid4(), display_name="แม่บัว", phone="0833333333",
               line_user_id="Udev_merchant_003", role="merchant", is_active=True, pdpa_consent_at=now)
    m4 = User(id=uuid.uuid4(), display_name="เจ๊จิ๋ม", phone="0844444445",
               line_user_id="Udev_merchant_004", role="merchant", is_active=True, pdpa_consent_at=now)
    db.add_all([m1, m2, m3, m4])

    # ─── Rider user ──────────────────────────────────────────────────────────
    rider_user = User(
        id=uuid.uuid4(),
        display_name="สมชาย วิ่งเร็ว",
        phone="0844444444",
        line_user_id="Udev_rider_001",
        role="rider",
        is_active=True,
        pdpa_consent_at=now,
    )
    db.add(rider_user)
    await db.flush()

    # ─── Shops ───────────────────────────────────────────────────────────────
    shop1 = Shop(
        id=uuid.uuid4(),
        owner_id=m1.id,
        name="ก๋วยเตี๋ยวป้าหล้า",
        description="ก๋วยเตี๋ยวเส้นใหญ่น้ำใส รสชาติต้นตำรับ อร่อยมา 20 ปี",
        phone="0811111111",
        status="active",
        is_open=True,
        full_address="123 หมู่ 3 บ้านเทอดไทย ต.เทอดไทย อ.แม่ฟ้าหลวง จ.เชียงราย",
        latitude=20.3120,
        longitude=99.6710,
        cuisine_types=["ก๋วยเตี๋ยว", "อาหารไทย"],
        avg_cooking_time=10,
        minimum_order=0,
        delivery_fee=15,
        bank_name="กสิกรไทย",
        bank_account="123-4-56789-0",
        bank_account_name="นางหล้า สุขใจ",
        approved_at=now,
        approved_by=admin.id,
    )
    shop2 = Shop(
        id=uuid.uuid4(),
        owner_id=m2.id,
        name="ข้าวมันไก่ดอยช้าง",
        description="ข้าวมันไก่สูตรต้นตำรับ น้ำซุปเข้มข้น ราคาเบา ๆ",
        phone="0822222222",
        status="active",
        is_open=True,
        full_address="45 หมู่ 5 บ้านดอยช้าง ต.เทอดไทย อ.แม่ฟ้าหลวง จ.เชียงราย",
        latitude=20.3150,
        longitude=99.6740,
        cuisine_types=["ข้าว", "อาหารไทย"],
        avg_cooking_time=8,
        minimum_order=0,
        delivery_fee=15,
        bank_name="ไทยพาณิชย์",
        bank_account="987-6-54321-0",
        bank_account_name="นายต้อย มีสุข",
        approved_at=now,
        approved_by=admin.id,
    )
    shop3 = Shop(
        id=uuid.uuid4(),
        owner_id=m3.id,
        name="น้ำเต้าหู้แม่บัว",
        description="น้ำเต้าหู้ร้อน-เย็น ปาท่องโก๋กรอบ เปิดเช้า ๆ",
        phone="0833333333",
        status="active",
        is_open=True,
        full_address="7 หมู่ 1 บ้านแม่บัว ต.เทอดไทย อ.แม่ฟ้าหลวง จ.เชียงราย",
        latitude=20.3090,
        longitude=99.6690,
        cuisine_types=["เครื่องดื่ม", "ของว่าง"],
        avg_cooking_time=5,
        minimum_order=0,
        delivery_fee=10,
        bank_name="กรุงเทพ",
        bank_account="555-5-55555-5",
        bank_account_name="นางบัว ดีงาม",
        approved_at=now,
        approved_by=admin.id,
    )
    shop4 = Shop(
        id=uuid.uuid4(),
        owner_id=m4.id,
        name="ส้มตำเจ๊จิ๋ม",
        description="ส้มตำปลาร้าหอม แซ่บถึงใจ",
        phone="0844444445",
        status="pending_approval",
        is_open=False,
        full_address="5 หมู่ 2 ต.เทอดไทย อ.แม่ฟ้าหลวง จ.เชียงราย",
        latitude=20.3100,
        longitude=99.6700,
        cuisine_types=["ส้มตำ", "อาหารไทย"],
        avg_cooking_time=15,
        minimum_order=50,
        delivery_fee=20,
    )
    db.add_all([shop1, shop2, shop3, shop4])
    await db.flush()

    # ─── Shop Hours ──────────────────────────────────────────────────────────
    for shop in [shop1, shop2, shop4]:
        for day in DAYS[:5]:  # mon-fri
            db.add(ShopHours(shop_id=shop.id, day=day,
                             open_time=time(8, 0), close_time=time(17, 0)))
        for day in DAYS[5:]:  # sat-sun closed
            db.add(ShopHours(shop_id=shop.id, day=day,
                             open_time=time(8, 0), close_time=time(12, 0), is_closed=True))

    for day in DAYS[:6]:  # shop3: mon-sat
        db.add(ShopHours(shop_id=shop3.id, day=day,
                         open_time=time(6, 0), close_time=time(11, 0)))
    db.add(ShopHours(shop_id=shop3.id, day="sun",
                     open_time=time(6, 0), close_time=time(10, 0), is_closed=True))

    # ─── Menu — Shop 1 (ก๋วยเตี๋ยวป้าหล้า) ──────────────────────────────────
    cat1a = MenuCategory(id=uuid.uuid4(), shop_id=shop1.id, name="ก๋วยเตี๋ยวน้ำ", sort_order=0)
    cat1b = MenuCategory(id=uuid.uuid4(), shop_id=shop1.id, name="ก๋วยเตี๋ยวแห้ง", sort_order=1)
    cat1c = MenuCategory(id=uuid.uuid4(), shop_id=shop1.id, name="เครื่องดื่ม", sort_order=2)
    db.add_all([cat1a, cat1b, cat1c])
    await db.flush()

    menu1 = [
        MenuItem(shop_id=shop1.id, category_id=cat1a.id, name="ก๋วยเตี๋ยวหมูน้ำใส", price=45,
                 description="เส้นใหญ่ หมูสับ ลูกชิ้น น้ำใสหวาน"),
        MenuItem(shop_id=shop1.id, category_id=cat1a.id, name="ก๋วยเตี๋ยวหมูน้ำตก", price=45,
                 description="เส้นใหญ่ หมูสามชั้น น้ำตกเผ็ดหอม"),
        MenuItem(shop_id=shop1.id, category_id=cat1a.id, name="ก๋วยเตี๋ยวเนื้อน้ำใส", price=55,
                 description="เส้นเล็ก เนื้อวัว ลูกชิ้นเนื้อ"),
        MenuItem(shop_id=shop1.id, category_id=cat1b.id, name="ก๋วยเตี๋ยวแห้งหมู", price=45,
                 description="เส้นใหญ่แห้ง หมูกรอบ ผักชี"),
        MenuItem(shop_id=shop1.id, category_id=cat1b.id, name="ก๋วยเตี๋ยวแห้งเนื้อ", price=55,
                 description="เส้นเล็กแห้ง เนื้อตุ๋น"),
        MenuItem(shop_id=shop1.id, category_id=cat1c.id, name="น้ำเปล่า", price=10),
        MenuItem(shop_id=shop1.id, category_id=cat1c.id, name="น้ำชาเย็น", price=20),
    ]
    db.add_all(menu1)

    # ─── Menu — Shop 2 (ข้าวมันไก่ดอยช้าง) ──────────────────────────────────
    cat2a = MenuCategory(id=uuid.uuid4(), shop_id=shop2.id, name="ข้าวมันไก่", sort_order=0)
    cat2b = MenuCategory(id=uuid.uuid4(), shop_id=shop2.id, name="เพิ่มเติม", sort_order=1)
    db.add_all([cat2a, cat2b])
    await db.flush()

    menu2 = [
        MenuItem(shop_id=shop2.id, category_id=cat2a.id, name="ข้าวมันไก่ต้ม", price=50,
                 description="ไก่ต้มนุ่ม ข้าวมันหอม น้ำซุปใส"),
        MenuItem(shop_id=shop2.id, category_id=cat2a.id, name="ข้าวมันไก่ทอด", price=55,
                 description="ไก่ทอดกรอบ ข้าวมันหอม"),
        MenuItem(shop_id=shop2.id, category_id=cat2a.id, name="ข้าวมันไก่คู่", price=80,
                 description="ไก่ต้ม+ไก่ทอด ข้าวมันหอม"),
        MenuItem(shop_id=shop2.id, category_id=cat2a.id, name="ข้าวมันไก่พิเศษ", price=65,
                 description="ไก่ต้มชิ้นใหญ่ ข้าวมันพิเศษ"),
        MenuItem(shop_id=shop2.id, category_id=cat2b.id, name="น้ำซุปเพิ่ม", price=10),
        MenuItem(shop_id=shop2.id, category_id=cat2b.id, name="ไข่ต้มยางมะตูม", price=10),
    ]
    db.add_all(menu2)

    # ─── Menu — Shop 3 (น้ำเต้าหู้แม่บัว) ────────────────────────────────────
    cat3a = MenuCategory(id=uuid.uuid4(), shop_id=shop3.id, name="น้ำเต้าหู้", sort_order=0)
    cat3b = MenuCategory(id=uuid.uuid4(), shop_id=shop3.id, name="ปาท่องโก๋", sort_order=1)
    db.add_all([cat3a, cat3b])
    await db.flush()

    menu3 = [
        MenuItem(shop_id=shop3.id, category_id=cat3a.id, name="น้ำเต้าหู้ร้อน", price=20,
                 description="น้ำเต้าหู้สดหวานน้อย"),
        MenuItem(shop_id=shop3.id, category_id=cat3a.id, name="น้ำเต้าหู้เย็น", price=25,
                 description="น้ำเต้าหู้สดใส่น้ำแข็ง"),
        MenuItem(shop_id=shop3.id, category_id=cat3a.id, name="น้ำเต้าหู้ผสมวุ้นเส้น", price=30,
                 description="น้ำเต้าหู้ + วุ้นเส้น + น้ำตาล"),
        MenuItem(shop_id=shop3.id, category_id=cat3b.id, name="ปาท่องโก๋ (2 ชิ้น)", price=15,
                 description="ปาท่องโก๋กรอบ ร้อน ๆ"),
        MenuItem(shop_id=shop3.id, category_id=cat3b.id, name="ปาท่องโก๋ (4 ชิ้น)", price=25,
                 description="เหมาะสำหรับ 2 คน"),
    ]
    db.add_all(menu3)
    await db.flush()

    # ─── Rider Profile ───────────────────────────────────────────────────────
    rider_profile = RiderProfile(
        user_id=rider_user.id,
        status="online",
        vehicle_type="motorcycle",
        license_plate="ชร-1234",
        current_latitude=20.3130,
        current_longitude=99.6720,
        last_location_at=now,
        approved_at=now,
        approved_by=admin.id,
        bank_name="กสิกรไทย",
        bank_account="111-2-33333-4",
        bank_account_name="นายสมชาย วิ่งเร็ว",
        total_deliveries=42,
        total_earnings=1890,
    )
    db.add(rider_profile)
    await db.flush()

    # ─── Sample Orders ────────────────────────────────────────────────────────
    # Order 1: delivered (COD)
    o1_id = uuid.uuid4()
    o1_item = menu1[0]
    o1 = Order(
        id=o1_id,
        order_number="TT-260501-001",
        customer_id=customer.id,
        shop_id=shop1.id,
        rider_id=rider_user.id,
        status="delivered",
        status_history=[
            {"status": "paid", "at": (now - timedelta(days=1, hours=2)).isoformat()},
            {"status": "preparing", "at": (now - timedelta(days=1, hours=1, minutes=50)).isoformat()},
            {"status": "delivered", "at": (now - timedelta(days=1, hours=1)).isoformat()},
        ],
        delivery_address="บ้านเลขที่ 99 หมู่ 2 ต.เทอดไทย",
        subtotal=90,
        delivery_fee=15,
        total=105,
        payment_method="cod",
        payment_status="confirmed",
        delivered_at=now - timedelta(days=1, hours=1),
        created_at=now - timedelta(days=1, hours=2),
    )
    db.add(o1)
    await db.flush()
    db.add(OrderItem(
        order_id=o1.id,
        menu_item_id=o1_item.id,
        item_name=o1_item.name,
        item_price=o1_item.price,
        quantity=2,
        line_total=90,
    ))

    # Past orders to populate charts
    for i in range(2, 8):
        old_now = now - timedelta(days=i)
        past_o = Order(
            id=uuid.uuid4(),
            order_number=f"TT-2604{30-i:02d}-001",
            customer_id=customer.id,
            shop_id=shop1.id,
            rider_id=rider_user.id,
            status="delivered",
            delivery_address="บ้านทดสอบ",
            subtotal=200,
            delivery_fee=15,
            total=215,
            payment_method="promptpay",
            payment_status="confirmed",
            delivered_at=old_now,
            created_at=old_now - timedelta(hours=1),
        )
        db.add(past_o)
        await db.flush()
        db.add(OrderItem(
            order_id=past_o.id,
            menu_item_id=menu1[0].id,
            item_name=menu1[0].name,
            item_price=menu1[0].price,
            quantity=4,
            line_total=180,
        ))

    # Order 2: preparing (PromptPay)
    o2_id = uuid.uuid4()
    o2_item = menu2[0]
    o2 = Order(
        id=o2_id,
        order_number="TT-260502-001",
        customer_id=customer.id,
        shop_id=shop2.id,
        status="preparing",
        status_history=[
            {"status": "paid", "at": (now - timedelta(minutes=15)).isoformat()},
            {"status": "preparing", "at": (now - timedelta(minutes=12)).isoformat()},
        ],
        delivery_address="บ้านเลขที่ 55 หมู่ 4 ต.เทอดไทย",
        subtotal=100,
        delivery_fee=15,
        total=115,
        payment_method="promptpay",
        payment_status="confirmed",
    )
    db.add(o2)
    await db.flush()
    db.add(OrderItem(
        order_id=o2.id,
        menu_item_id=o2_item.id,
        item_name=o2_item.name,
        item_price=o2_item.price,
        quantity=2,
        line_total=100,
    ))

    # Order 3: pending_payment (PromptPay, just placed)
    o3_id = uuid.uuid4()
    o3_item = menu3[0]
    o3 = Order(
        id=o3_id,
        order_number="TT-260502-002",
        customer_id=customer.id,
        shop_id=shop3.id,
        status="pending_payment",
        status_history=[],
        delivery_address="บ้านเลขที่ 12 หมู่ 1 ต.เทอดไทย",
        subtotal=40,
        delivery_fee=10,
        total=50,
        payment_method="promptpay",
        payment_status="pending",
    )
    db.add(o3)
    await db.flush()
    db.add(OrderItem(
        order_id=o3.id,
        menu_item_id=o3_item.id,
        item_name=o3_item.name,
        item_price=o3_item.price,
        quantity=2,
        line_total=40,
    ))

    # ─── Delivery Job for delivered order ─────────────────────────────────────
    job = DeliveryJob(
        order_id=o1.id,
        rider_id=rider_user.id,
        status="delivered",
        assigned_at=now - timedelta(days=1, hours=1, minutes=25),
        picked_up_at=now - timedelta(days=1, hours=1, minutes=10),
        delivered_at=now - timedelta(days=1, hours=1),
        delivery_fee=15,
        distance_km=1.2,
    )
    db.add(job)

    # Add jobs for past orders
    for i in range(2, 8):
        db.add(DeliveryJob(
            order_id=uuid.uuid4(), # Just dummy to show earnings
            rider_id=rider_user.id,
            status="delivered",
            delivered_at=now - timedelta(days=i),
            delivery_fee=15,
        ))

    await db.commit()
    print("Seed completed successfully!")
    print()
    print("  Admin login:    admin@thoetthai.com / admin1234")
    print("  Customer LINE:  Udev_customer_001")
    print("  Rider LINE:     Udev_rider_001")
    print("  Merchant LINE:  Udev_merchant_001 / _002 / _003 / _004")
    print()
    print("  Shops: 3 active, 1 pending")
    print("  Orders: 7 delivered, 1 preparing, 1 pending_payment")


async def main():
    async with SessionLocal() as db:
        await clear_tables(db)
        await seed(db)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
