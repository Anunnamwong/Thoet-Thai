"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Tag, ChevronRight, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToastStore } from "@/stores/toast";

type PaymentMethod = "cod" | "promptpay";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToastStore();
  const { items, shopId, shopName, updateQuantity, clearCart } = useCartStore();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [note, setNote] = useState("");
  const [isValidating, setValidating] = useState(false);

  const deliveryFee = 20;
  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!shopId || items.length === 0) return;

    setValidating(true);
    try {
      const res = await api.validateOrder({
        shop_id: shopId,
        items: items.map((it) => ({
          menu_item_id: it.menu_item_id,
          quantity: it.quantity,
          item_price: it.menu_item.price,
          selected_options: it.selected_options || [],
        })),
        delivery_address: "temp",
        payment_method: payment,
      });

      if (res.data?.valid) {
        router.push(`/checkout?payment=${payment}&total=${total}`);
      } else {
        const reason = res.data?.reason;
        let msg = "ไม่สามารถดำเนินการต่อได้";
        if (reason === "shop_closed") msg = "ขออภัยค่ะ ร้านปิดให้บริการแล้ว หรืออยู่นอกเวลาทำการ";
        else if (reason?.startsWith("item_unavailable")) msg = "ขออภัยค่ะ มีบางเมนูหมดแล้ว";
        else if (reason === "price_changed") msg = "ราคาอาหารมีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง";
        
        toast(msg);
      }
    } catch {
      toast("เกิดข้อผิดพลาดในการตรวจสอบตะกร้าสินค้า");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-12 pb-2.5 border-b border-border bg-surface-bg shrink-0">
        <button
          onClick={() => router.back()}
          className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-text-primary"
          aria-label="ย้อนกลับ"
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-text-primary">ตะกร้าของฉัน</div>
          {shopName && (
            <div className="text-xs text-text-secondary mt-0.5">{shopName}</div>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("ยืนยันการล้างตะกร้าใช่ไหม?")) {
                clearCart();
              }
            }}
            className="text-xs font-medium text-status-danger px-2.5 py-1.5 rounded-lg active:bg-status-danger-bg transition-colors"
          >
            ล้างตะกร้า
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {items.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="text-5xl mb-3">🛒</div>
            <div className="text-base font-semibold text-text-primary mb-1.5">ตะกร้ายังว่างอยู่</div>
            <div className="text-sm text-text-secondary leading-relaxed">
              เลือกเมนูจากร้านโปรดได้เลยครับ
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="p-4 flex flex-col gap-2.5">
              {items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex gap-2.5 p-3 bg-surface-card rounded-card border border-border"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#F3EBDD] shrink-0 grid place-items-center text-[9px] text-text-tertiary font-mono overflow-hidden">
                    {item.menu_item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.menu_item.image_url}
                        alt={item.menu_item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.menu_item.name.slice(0, 5)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary mb-0.5">
                      {item.menu_item.name}
                    </div>
                    <div className="text-xs text-text-secondary mb-1.5">
                      ฿{item.menu_item.price} × {item.quantity}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary tabular-nums">
                        {formatPrice(item.line_total)}
                      </span>
                      <div className="flex items-center border border-border rounded-full h-[30px]">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          className="w-[30px] h-[30px] grid place-items-center text-text-primary"
                          aria-label="ลด"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="min-w-[18px] text-center text-sm font-semibold text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          className="w-[30px] h-[30px] grid place-items-center text-text-primary"
                          aria-label="เพิ่ม"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="px-4 pb-3">
              <div className="bg-surface-card rounded-card border border-border p-3">
                <div className="text-xs text-text-secondary mb-1">หมายเหตุถึงร้าน</div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ไม่ใส่ผัก เพิ่มน้ำซุปแยก…"
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                />
              </div>
            </div>

            {/* Promo */}
            <div className="px-4 pb-3">
              <button className="w-full flex items-center justify-between bg-surface-card border border-border rounded-card px-3.5 py-3">
                <span className="flex items-center gap-2 text-text-primary">
                  <Tag size={16} strokeWidth={2} />
                  <span className="text-sm font-medium">ใส่โค้ดส่วนลด</span>
                </span>
                <ChevronRight size={16} className="text-text-secondary" />
              </button>
            </div>

            {/* Summary */}
            <div className="px-4 pb-4">
              <div className="bg-surface-card rounded-card border border-border p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">สรุปยอด</h3>
                {[
                  { label: "ค่าอาหาร", value: subtotal },
                  { label: "ค่าจัดส่ง", value: deliveryFee },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm text-text-secondary py-1">
                    <span>{label}</span>
                    <span className="tabular-nums">฿{value.toLocaleString("th-TH")}</span>
                  </div>
                ))}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-text-primary">รวมทั้งหมด</span>
                  <span className="text-lg font-semibold text-text-primary tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-4 pb-6">
              <div className="flex gap-2">
                {(
                  [
                    { id: "cod" as const, label: "จ่ายปลายทาง", icon: "💵" },
                    { id: "promptpay" as const, label: "PromptPay", icon: "🇹🇭" },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex-1 py-3 rounded-card flex flex-col items-center gap-1 border-[1.5px] ${
                      payment === p.id
                        ? "bg-brand-secondary-light border-brand-secondary"
                        : "bg-surface-card border-border"
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span
                      className={`text-xs font-${payment === p.id ? "semibold" : "medium"} ${
                        payment === p.id ? "text-brand-secondary" : "text-text-primary"
                      }`}
                    >
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="px-4 py-2.5 pb-3 bg-surface-bg border-t border-border shrink-0">
          <button
            onClick={handleCheckout}
            disabled={isValidating}
            className="w-full h-[50px] rounded-card bg-brand-primary text-white text-base font-semibold flex items-center justify-center gap-2.5 disabled:opacity-70"
          >
            {isValidating ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                สั่งซื้อ · {formatPrice(total)}
                <ChevronRight size={18} strokeWidth={2.2} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
