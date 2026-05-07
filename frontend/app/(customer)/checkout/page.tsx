"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Wallet, ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useCartStore } from "@/stores/cart";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse, Shop, Address } from "@/types";

const DEFAULT_ADDRESS = "123/4 หมู่ 1 ต.เทอดไทย อ.แม่ฟ้าหลวง เชียงราย 57240";

interface OrderOut {
  id: string;
  order_number: string;
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const payment = params.get("payment") ?? "cod";
  const { items, shopId, shopName, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: addressRes } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.getAddresses() as Promise<ApiResponse<Address[]>>,
  });
  const { data: shopRes, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => api.getShop(shopId as string) as Promise<ApiResponse<Shop>>,
    enabled: !!shopId,
  });

  const addresses = addressRes?.data || [];
  const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
  const shop = shopRes?.data ?? null;
  const shopClosed = !!shop && (!shop.is_open || shop.status !== "active");

  const deliveryFee = shop?.delivery_fee ?? 20;
  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const total = subtotal + deliveryFee;

  const handleConfirm = async () => {
    if (!shopId || items.length === 0) return;
    if (shopClosed) {
      setError("ร้านนี้ปิดให้บริการอยู่ กรุณาเลือกร้านอื่น");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Final lightweight validation check
      const validRes = await api.validateOrder({
        shop_id: shopId,
        items: items.map((it) => ({
          menu_item_id: it.menu_item_id,
          quantity: it.quantity,
          item_price: it.menu_item.price,
          selected_options: it.selected_options || [],
        })),
        delivery_address: defaultAddress?.full_address || DEFAULT_ADDRESS,
        payment_method: payment,
      });

      if (!validRes.data?.valid) {
        setError("ไม่สามารถสั่งซื้อได้: ร้านอาจจะปิดแล้วหรือมีสินค้าบางรายการหมด");
        setLoading(false);
        return;
      }

      // 2. Create Order
      const res = await api.createOrder({
        shop_id: shopId,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          item_price: i.menu_item.price,
          quantity: i.quantity,
          selected_options: i.selected_options ?? [],
          special_note: i.special_note ?? null,
        })),
        delivery_address: defaultAddress?.full_address || DEFAULT_ADDRESS,
        delivery_latitude: defaultAddress?.latitude || null,
        delivery_longitude: defaultAddress?.longitude || null,
        payment_method: payment,
      }) as ApiResponse<OrderOut> & { detail?: string };

      if (!res.success || !res.data) {
        setError(res.detail ?? res.error ?? "สั่งซื้อไม่สำเร็จ กรุณาลองอีกครั้ง");
        return;
      }

      clearCart();
      const orderId = res.data.id;

      if (payment === "promptpay") {
        router.push(`/payment?order_id=${orderId}&amount=${total}`);
      } else {
        router.push(`/orders/${orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="ยืนยันคำสั่งซื้อ" sub={shopName ?? ""} onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-3">
        {/* Address */}
        <button
          onClick={() => router.push("/profile/addresses")}
          className="bg-surface-card rounded-card border border-border p-3.5 flex gap-2.5 items-start text-left"
        >
          <div className="w-8 h-8 rounded-[10px] bg-brand-primary-light text-brand-primary grid place-items-center shrink-0">
            <MapPin size={16} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-text-secondary mb-0.5">ส่งไปที่</div>
            <div className="text-sm font-semibold text-text-primary">
              {defaultAddress ? defaultAddress.label : "เลือกที่อยู่จัดส่ง"}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 leading-snug truncate">
              {defaultAddress ? defaultAddress.full_address : "ยังไม่ได้ระบุที่อยู่"}
            </div>
          </div>
          <ChevronRight size={16} className="text-text-secondary shrink-0 mt-1" />
        </button>

        {/* Payment method */}
        <div className="bg-surface-card rounded-card border border-border p-3.5 flex gap-2.5 items-center">
          <div className="w-8 h-8 rounded-[10px] bg-brand-secondary-light text-brand-secondary grid place-items-center shrink-0 text-base">
            {payment === "cod" ? "💵" : "🇹🇭"}
          </div>
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-0.5">วิธีชำระเงิน</div>
            <div className="text-sm font-semibold text-text-primary">
              {payment === "cod" ? "จ่ายปลายทาง (เงินสด)" : "พร้อมเพย์ (PromptPay QR)"}
            </div>
          </div>
          <Wallet size={16} className="text-text-secondary shrink-0" />
        </div>

        {/* Order items */}
        <div className="bg-surface-card rounded-card border border-border p-3.5">
          <div className="text-sm font-semibold text-text-primary mb-2.5">
            รายการ ({items.length})
          </div>
          {items.map((item) => (
            <div key={item.menu_item_id} className="flex justify-between py-1.5 text-sm">
              <span>
                <span className="text-text-secondary mr-1.5">{item.quantity}×</span>
                <span className="text-text-primary">{item.menu_item.name}</span>
              </span>
              <span className="tabular-nums text-text-primary">
                {formatPrice(item.line_total)}
              </span>
            </div>
          ))}
          <div className="h-px bg-border my-2.5" />
          <div className="flex justify-between text-sm text-text-secondary py-1">
            <span>ค่าอาหาร</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary py-1">
            <span>ค่าจัดส่ง</span>
            <span className="tabular-nums">{formatPrice(deliveryFee)}</span>
          </div>
          <div className="h-px bg-border my-2.5" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-text-primary">รวมทั้งหมด</span>
            <span className="text-lg font-semibold text-text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-brand-primary-light rounded-[10px] px-3 py-2.5 text-xs text-brand-primary leading-relaxed">
          กดยืนยันแล้ว ร้านจะเริ่มทำอาหารให้ทันทีนะคะ — ยกเลิกได้ภายใน 1 นาทีเท่านั้น
        </div>

        {error && (
          <div className="bg-status-danger-bg rounded-[10px] px-3 py-2.5 text-xs text-status-danger">
            {error}
          </div>
        )}
        {shopClosed && (
          <div className="bg-status-danger-bg rounded-[10px] px-3 py-2.5 text-xs text-status-danger">
            ร้านนี้ปิดให้บริการอยู่ ยังไม่สามารถยืนยันคำสั่งซื้อได้
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 pb-3 bg-surface-bg border-t border-border shrink-0">
        <button
          onClick={handleConfirm}
          disabled={loading || shopLoading || shopClosed || items.length === 0}
          className="w-full h-[50px] rounded-card bg-brand-primary text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            `ยืนยันและสั่งซื้อ · ${formatPrice(total)}`
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
