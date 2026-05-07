import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.order import Order, OrderItem
from app.models.shop import Shop
from app.models.menu import MenuItem
from app.models.user import User
from app.schemas.order import OrderCreate, UpdateStatusRequest


VALID_TRANSITIONS: dict[str, list[str]] = {
    "pending_payment": ["paid", "cancelled"],
    "paid":            ["preparing", "ready_for_pickup", "cancelled"],
    "preparing":       ["ready_for_pickup"],
    "ready_for_pickup": ["rider_assigned"],
    "rider_assigned":  ["picked_up"],
    "picked_up":       ["delivered"],
    "delivered":       [],
    "cancelled":       [],
    "refunded":        [],
}

CUSTOMER_CANCEL_WINDOW = timedelta(minutes=2)


async def _generate_order_number(db: AsyncSession) -> str:
    today = datetime.now(timezone.utc).strftime("%y%m%d")
    result = await db.execute(
        select(func.count(Order.id)).where(
            Order.order_number.like(f"TT-{today}-%")
        )
    )
    count = result.scalar() or 0
    return f"TT-{today}-{count + 1:03d}"


async def _is_shop_open(db: AsyncSession, shop: Shop) -> bool:
    """Check if shop is open based on manual toggle. 
    Business hours can be used for automated toggling or display, 
    แต่ในตอนนี้เราจะยึดตามปุ่มเปิด-ปิดร้าน (is_open) เป็นหลักเพื่อให้ร้านค้าควบคุมได้โดยตรง
    """
    if not shop.is_open or shop.status != "active":
        return False

    return True

async def create_order(db: AsyncSession, customer: User, data: OrderCreate) -> Order:
    # Validate shop exists and is open
    shop_result = await db.execute(
        select(Shop)
        .where(Shop.id == data.shop_id, Shop.deleted_at.is_(None))
        .with_for_update()
    )
    shop = shop_result.scalar_one_or_none()
    if not shop:
        raise ValueError("ไม่พบร้านค้า")
    
    if not await _is_shop_open(db, shop):
        raise ValueError("ร้านนี้ปิดให้บริการอยู่")

    # Validate + price menu items
    subtotal = 0
    order_items = []
    for it in data.items:
        mi_result = await db.execute(
            select(MenuItem)
            .where(
                MenuItem.id == it.menu_item_id,
                MenuItem.shop_id == data.shop_id,
                MenuItem.deleted_at.is_(None),
            )
            .with_for_update()
        )
        mi = mi_result.scalar_one_or_none()
        if not mi:
            raise ValueError(f"ไม่พบเมนูที่ต้องการ ({it.menu_item_id})")
        if not mi.is_available:
            raise ValueError(f"เมนู '{mi.name}' หมดแล้ว")

        options_extra = sum(
            c.get("extra_price", 0)
            for opt in it.selected_options
            for c in [opt]
        )
        unit_price = mi.price + options_extra
        line_total = unit_price * it.quantity
        subtotal += line_total

        order_items.append(
            OrderItem(
                menu_item_id=mi.id,
                item_name=mi.name,
                item_price=unit_price,
                quantity=it.quantity,
                selected_options=it.selected_options,
                special_note=it.special_note,
                line_total=line_total,
            )
        )

    delivery_fee = shop.delivery_fee or 20
    total = subtotal + delivery_fee

    # Determine initial status
    if data.payment_method == "cod":
        initial_status = "paid"
        payment_status = "pending"  # collected on delivery
    else:
        initial_status = "pending_payment"
        payment_status = "pending"

    order_number = await _generate_order_number(db)

    order = Order(
        order_number=order_number,
        customer_id=customer.id,
        shop_id=data.shop_id,
        status=initial_status,
        status_history=[
            {"status": initial_status, "timestamp": datetime.now(timezone.utc).isoformat()}
        ],
        delivery_address=data.delivery_address,
        delivery_latitude=data.delivery_latitude,
        delivery_longitude=data.delivery_longitude,
        delivery_note=data.delivery_note,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=0,
        total=total,
        payment_method=data.payment_method,
        payment_status=payment_status,
        promo_code=data.promo_code,
    )
    db.add(order)
    await db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    await db.flush()
    await db.refresh(order)

    # Broadcast new order to merchant
    from app.core.websocket import manager
    await manager.broadcast_event(
        {"type": "NEW_ORDER", "order_id": str(order.id)},
        target_user=str(shop.owner_id)
    )
    return order


async def list_orders(
    db: AsyncSession,
    user: User,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Order], int]:
    q = select(Order)

    if user.role == "customer":
        q = q.where(Order.customer_id == user.id)
    elif user.role == "merchant":
        # Get merchant's shop
        shop_result = await db.execute(
            select(Shop.id).where(Shop.owner_id == user.id, Shop.deleted_at.is_(None))
        )
        shop_ids = [r[0] for r in shop_result.fetchall()]
        q = q.where(Order.shop_id.in_(shop_ids))
    elif user.role == "rider":
        # Rider sees active assigned orders or unassigned orders that are ready
        # for pickup. Preparing/paid orders are not claimable yet.
        q = q.where(
            ((Order.rider_id == user.id) & Order.status.in_(["rider_assigned", "picked_up"])) |
            ((Order.status == "ready_for_pickup") & Order.rider_id.is_(None))
        )
    # admin sees all

    if status:
        q = q.where(Order.status == status)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar() or 0

    q = q.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return result.scalars().all(), total


async def get_order(db: AsyncSession, order_id: uuid.UUID, user: User) -> Order | None:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        return None
    # Authorization
    if user.role == "customer" and order.customer_id != user.id:
        return None
    if user.role == "rider":
        # Can see if:
        # 1. Assigned to them
        # 2. In progress and unassigned
        # 3. Just assigned (rider_assigned) - relaxed check to handle race condition
        can_see = (
            order.rider_id == user.id or 
            (order.rider_id is None and order.status in ("paid", "preparing", "ready_for_pickup", "rider_assigned"))
        )
        if not can_see:
            return None
    if user.role == "merchant":
        shop_result = await db.execute(
            select(Shop.id).where(Shop.owner_id == user.id, Shop.id == order.shop_id)
        )
        if not shop_result.scalar_one_or_none():
            return None
            
    # Include rider location if assigned
    if order.rider_id:
        from app.models.rider import RiderProfile
        rider_res = await db.execute(
            select(RiderProfile).where(RiderProfile.user_id == order.rider_id)
        )
        profile = rider_res.scalar_one_or_none()
        if profile:
            # Dynamically set attributes for the Pydantic schema to pick up
            setattr(order, "rider_latitude", profile.current_latitude)
            setattr(order, "rider_longitude", profile.current_longitude)
            
    return order


async def get_order_items(db: AsyncSession, order_id: uuid.UUID) -> list[OrderItem]:
    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    return result.scalars().all()


async def update_status(
    db: AsyncSession,
    order_id: uuid.UUID,
    user: User,
    req: UpdateStatusRequest,
) -> Order:
    order = await get_order(db, order_id, user)
    if not order:
        raise ValueError("ไม่พบออเดอร์")

    if user.role == "customer":
        raise ValueError("ลูกค้าไม่สามารถเปลี่ยนสถานะออเดอร์เองได้")
    if user.role == "rider":
        raise ValueError("ไรเดอร์ต้องอัปเดตสถานะผ่านงานจัดส่งเท่านั้น")
    if user.role == "merchant":
        merchant_transitions = {
            "paid": {"preparing"},
            "preparing": {"ready_for_pickup"},
        }
        if req.status not in merchant_transitions.get(order.status, set()):
            raise ValueError("ร้านค้าเปลี่ยนสถานะนี้ไม่ได้")
    if user.role == "admin" and req.status in {"rider_assigned", "picked_up", "delivered"}:
        raise ValueError("สถานะฝั่งไรเดอร์ต้องอัปเดตผ่านงานจัดส่งเท่านั้น")

    allowed = VALID_TRANSITIONS.get(order.status, [])
    if req.status not in allowed:
        raise ValueError(f"ไม่สามารถเปลี่ยนสถานะจาก '{order.status}' เป็น '{req.status}' ได้")

    order.status = req.status
    history = list(order.status_history or [])
    entry: dict = {"status": req.status, "timestamp": datetime.now(timezone.utc).isoformat()}
    if req.note:
        entry["note"] = req.note
    history.append(entry)
    order.status_history = history

    if req.status == "preparing" and req.prep_time_mins:
        order.estimated_ready_at = datetime.now(timezone.utc) + timedelta(minutes=req.prep_time_mins)
        order.cooking_time = req.prep_time_mins

    if req.status == "delivered":
        order.delivered_at = datetime.now(timezone.utc)
        order.payment_status = "confirmed"

    await db.flush()
    await db.refresh(order)

    # Broadcast status update
    from app.core.websocket import manager
    event = {
        "type": "ORDER_UPDATED", 
        "order_id": str(order.id), 
        "status": order.status,
        "estimated_ready_at": order.estimated_ready_at.isoformat() if order.estimated_ready_at else None
    }
    
    # Notify customer
    await manager.broadcast_event(event, target_user=str(order.customer_id))
    
    # Notify merchant
    shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
    owner_id = shop_result.scalar()
    if owner_id:
        await manager.broadcast_event(event, target_user=str(owner_id))
        
    # Notify rider if assigned
    if order.rider_id:
        await manager.broadcast_event(event, target_user=str(order.rider_id))

    if order.status == "ready_for_pickup" and order.rider_id is None:
        await manager.broadcast_event(
            {"type": "ORDER_AVAILABLE", "order_id": str(order.id)},
            target_role="rider",
        )

    return order


async def cancel_order(
    db: AsyncSession,
    order_id: uuid.UUID,
    user: User,
    reason: str,
) -> Order:
    order = await get_order(db, order_id, user)
    if not order:
        raise ValueError("ไม่พบออเดอร์")

    if user.role == "customer":
        now = datetime.now(timezone.utc)
        if order.status == "pending_payment":
            pass
        elif order.status == "paid":
            created_at = order.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            if now - created_at > CUSTOMER_CANCEL_WINDOW:
                raise ValueError("เลยเวลายกเลิกแล้ว กรุณาติดต่อร้านค้าหรือแอดมิน")
        else:
            raise ValueError("ลูกค้ายกเลิกได้ก่อนร้านเริ่มทำอาหารเท่านั้น")
    if user.role == "merchant" and order.status != "paid":
        raise ValueError("ร้านค้ายกเลิกได้เฉพาะออเดอร์ใหม่ที่ยังไม่ได้เริ่มทำ")
    if user.role == "rider":
        raise ValueError("ไรเดอร์ไม่สามารถยกเลิกออเดอร์ได้ กรุณาปฏิเสธหรือแจ้งแอดมิน")

    if "cancelled" not in VALID_TRANSITIONS.get(order.status, []):
        raise ValueError("ออเดอร์นี้ไม่สามารถยกเลิกได้แล้ว")

    order.status = "cancelled"
    order.cancel_reason = reason
    order.cancelled_at = datetime.now(timezone.utc)
    history = list(order.status_history or [])
    history.append({
        "status": "cancelled",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": reason,
    })
    order.status_history = history

    await db.flush()
    await db.refresh(order)

    # Broadcast status update
    from app.core.websocket import manager
    event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": "cancelled"}
    
    # Notify customer
    await manager.broadcast_event(event, target_user=str(order.customer_id))
    
    # Notify merchant
    shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
    owner_id = shop_result.scalar()
    if owner_id:
        await manager.broadcast_event(event, target_user=str(owner_id))
        
    # Notify rider if assigned
    if order.rider_id:
        await manager.broadcast_event(event, target_user=str(order.rider_id))

    return order
