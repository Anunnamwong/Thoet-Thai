import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment import Payment
from app.models.order import Order
from app.models.shop import Shop
from app.core.config import get_settings

settings = get_settings()


def _append_order_status_history(order: Order, status: str, note: str | None = None) -> None:
    history = list(order.status_history or [])
    entry = {"status": status, "timestamp": datetime.now(timezone.utc).isoformat()}
    if note:
        entry["note"] = note
    history.append(entry)
    order.status_history = history


def _build_promptpay_payload(amount: int) -> str:
    """Build PromptPay QR payload string (EMV format simplified)."""
    phone = settings.promptpay_id.replace("-", "").replace(" ", "")
    if len(phone) == 10 and phone.startswith("0"):
        phone = "0066" + phone[1:]

    amount_str = f"{amount / 100:.2f}"
    merchant_id = f"0066{phone}" if not phone.startswith("0066") else phone

    # Simplified EMV QR (production should use a proper library)
    payload = (
        "000201"                          # Payload format indicator
        "010212"                          # Point of initiation
        f"2937"                           # Merchant account info (PromptPay)
        f"0016A000000677010111"
        f"01{len(merchant_id):02d}{merchant_id}"
        f"5303764"                        # Currency THB
        f"54{len(amount_str):02d}{amount_str}"
        "6304"                            # CRC placeholder
    )
    # CRC16-CCITT
    crc = 0xFFFF
    for char in payload:
        crc ^= ord(char) << 8
        for _ in range(8):
            crc = (crc << 1) ^ 0x1021 if crc & 0x8000 else crc << 1
        crc &= 0xFFFF
    return payload + f"{crc:04X}"


async def create_promptpay_payment(
    db: AsyncSession,
    order_id: uuid.UUID,
    user_id: uuid.UUID | None = None,
) -> Payment:
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise ValueError("ไม่พบออเดอร์")
    if user_id is not None and order.customer_id != user_id:
        raise ValueError("คุณไม่มีสิทธิ์เข้าถึงการชำระเงินของออเดอร์นี้")
    if order.payment_method != "promptpay":
        raise ValueError("ออเดอร์นี้ไม่ได้เลือกชำระผ่านพร้อมเพย์")

    # Check for existing payment
    existing = await db.execute(
        select(Payment).where(Payment.order_id == order_id, Payment.status == "pending")
    )
    if p := existing.scalar_one_or_none():
        return p

    qr_payload = _build_promptpay_payload(order.total)
    payment = Payment(
        order_id=order_id,
        method="promptpay",
        amount=order.total,
        status="pending",
        qr_payload=qr_payload,
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment


async def verify_payment(db: AsyncSession, payment_id: uuid.UUID, admin_id: uuid.UUID) -> Payment:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise ValueError("ไม่พบรายการชำระเงิน")

    payment.status = "confirmed"
    payment.verified_by = admin_id
    payment.verified_at = datetime.now(timezone.utc)

    # Update order
    order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
    order = order_result.scalar_one_or_none()
    if order:
        order.payment_status = "confirmed"
        if order.status == "pending_payment":
            order.status = "paid"
            _append_order_status_history(order, "paid", "PromptPay verified by admin")

    await db.flush()
    await db.refresh(payment)
    return payment


async def mock_confirm_promptpay(
    db: AsyncSession,
    order_id: uuid.UUID,
    user_id: uuid.UUID,
    slip_image_url: str | None = None,
) -> Payment:
    """MVP-only PromptPay confirmation path.

    Keeps payment state changes inside the payment service instead of allowing
    the customer UI to update order status directly.
    """
    order_result = await db.execute(
        select(Order).where(Order.id == order_id).with_for_update()
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise ValueError("ไม่พบออเดอร์")
    if order.customer_id != user_id:
        raise ValueError("คุณไม่มีสิทธิ์ยืนยันการชำระเงินของออเดอร์นี้")
    if order.payment_method != "promptpay":
        raise ValueError("ออเดอร์นี้ไม่ได้เลือกชำระผ่านพร้อมเพย์")
    if order.status != "pending_payment":
        raise ValueError("ออเดอร์นี้ไม่อยู่ในสถานะรอชำระเงิน")

    payment_result = await db.execute(
        select(Payment).where(Payment.order_id == order_id, Payment.method == "promptpay")
    )
    payment = payment_result.scalar_one_or_none()
    if not payment:
        payment = await create_promptpay_payment(db, order_id, user_id)

    now = datetime.now(timezone.utc)
    payment.status = "confirmed"
    payment.verified_by = user_id
    payment.verified_at = now
    payment.slip_image_url = slip_image_url

    order.payment_status = "confirmed"
    order.status = "paid"
    _append_order_status_history(order, "paid", "PromptPay mock confirmation")

    await db.flush()
    await db.refresh(payment)

    from app.core.websocket import manager
    event = {"type": "ORDER_UPDATED", "order_id": str(order.id), "status": order.status}
    await manager.broadcast_event(event, target_user=str(order.customer_id))

    shop_result = await db.execute(select(Shop.owner_id).where(Shop.id == order.shop_id))
    owner_id = shop_result.scalar()
    if owner_id:
        await manager.broadcast_event(event, target_user=str(owner_id))

    return payment
