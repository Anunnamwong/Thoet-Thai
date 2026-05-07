"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Heart, Clock, Bike, Star, Tag, Plus, Minus, Flame } from "lucide-react";
import type { ApiResponse, Shop, MenuCategory, MenuItem } from "@/types";
import { api } from "@/lib/api";
import { useCartStore } from "@/stores/cart";
import { cn, formatPrice } from "@/lib/utils";


function MenuItemRow({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const soldOut = !item.is_available;
  return (
    <div
      className={cn(
        "flex gap-3 py-3.5 items-start border-b border-border",
        soldOut && "opacity-55"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-text-primary">{item.name}</span>
          {item.options?.length > 0 && (
            <Flame size={13} className="text-brand-primary shrink-0" />
          )}
        </div>
        {item.description && (
          <p className="text-xs text-text-secondary leading-snug mb-1.5">{item.description}</p>
        )}
        {soldOut ? (
          <span className="text-xs text-status-danger font-medium">หมดวันนี้</span>
        ) : (
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            ฿{item.price.toLocaleString("th-TH")}
          </span>
        )}
      </div>

      <div className="w-20 h-20 rounded-[10px] shrink-0 bg-[#F3EBDD] relative overflow-hidden border border-border">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[10px] text-text-tertiary font-mono">
            {item.name.slice(0, 6)}…
          </div>
        )}
        {!soldOut &&
          (qty > 0 ? (
            <div className="absolute bottom-1.5 right-1.5 flex items-center bg-text-primary rounded-full h-7 shadow-md">
              <button
                onClick={onRemove}
                className="w-7 h-7 grid place-items-center text-white"
                aria-label="ลด"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="text-white text-xs font-semibold min-w-[14px] text-center">
                {qty}
              </span>
              <button
                onClick={onAdd}
                className="w-7 h-7 grid place-items-center text-white"
                aria-label="เพิ่ม"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white border border-border grid place-items-center shadow-sm text-text-primary"
              aria-label="เพิ่ม"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          ))}
      </div>
    </div>
  );
}

export default function ShopDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { items: cartItems, addItem, updateQuantity, shopId: cartShopId } = useCartStore();

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", id],
    queryFn: () => api.getShop(id) as Promise<ApiResponse<Shop>>,
  });

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["shop-menu", id],
    queryFn: () => api.getShopMenu(id) as Promise<ApiResponse<MenuCategory[]>>,
  });

  const shop = shopData?.data;
  const categories = menuData?.data ?? [];

  const getQty = (itemId: string) =>
    cartItems.find((i) => i.menu_item_id === itemId)?.quantity ?? 0;

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.line_total, 0);

  const handleAdd = (item: MenuItem) => {
    addItem(item, 1, [], "");
  };

  const handleRemove = (item: MenuItem) => {
    const qty = getQty(item.id);
    if (qty > 0) updateQuantity(item.id, qty - 1);
  };

  if (shopLoading || menuLoading) {
    return (
      <div className="flex flex-col h-full bg-surface-bg">
        <div className="h-[180px] bg-border animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-border rounded animate-pulse w-1/2" />
          <div className="h-4 bg-border rounded animate-pulse w-3/4" />
          <div className="h-4 bg-border rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col h-full bg-surface-bg items-center justify-center p-8 text-center">
        <div className="text-4xl mb-3">🍽</div>
        <div className="text-base font-semibold text-text-primary mb-1">ไม่พบร้านนี้</div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-brand-primary font-medium"
        >
          ย้อนกลับ
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Hero */}
        <div className="relative h-[180px] overflow-hidden">
          {shop.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.cover_image_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20" />
          )}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent" />
          <button
            onClick={() => router.back()}
            className="absolute top-12 left-3 w-[38px] h-[38px] rounded-full bg-white/95 grid place-items-center text-text-primary z-10"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <button
            className="absolute top-12 right-3 w-[38px] h-[38px] rounded-full bg-white/95 grid place-items-center text-text-primary z-10"
            aria-label="บันทึก"
          >
            <Heart size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Info card — pulled up */}
        <div className="px-4 -mt-7 relative z-10">
          <div className="bg-surface-card rounded-modal border border-border p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-xl font-semibold text-text-primary leading-tight">{shop.name}</h1>
              {!shop.is_open && (
                <span className="bg-status-danger-bg text-status-danger text-xs font-semibold px-2 py-1 rounded-md shrink-0">
                  ปิดอยู่
                </span>
              )}
            </div>
            {shop.description && (
              <p className="text-sm text-text-secondary leading-snug mb-2.5">{shop.description}</p>
            )}
            <div className="flex items-center gap-2.5 text-xs text-text-secondary pt-2.5 border-t border-border">
              <span className="flex items-center gap-1 text-text-primary font-semibold">
                <Star size={13} className="text-status-warning" />
                4.8
              </span>
              <span>(42 รีวิว)</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                <Clock size={12} strokeWidth={2} />
                {shop.avg_cooking_time} นาที
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                <Bike size={12} strokeWidth={2} />
                ฿{shop.delivery_fee}
              </span>
            </div>
            {shop.minimum_order > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 bg-brand-primary-light text-brand-primary text-xs font-medium px-2.5 py-2 rounded-lg">
                <Tag size={13} strokeWidth={2} />
                สั่งขั้นต่ำ {formatPrice(shop.minimum_order)}
              </div>
            )}
          </div>
        </div>

        {/* Menu sections */}
        <div className="px-4 pt-5 pb-28">
          {categories.length === 0 ? (
            <div className="py-10 text-center text-text-secondary text-sm">
              ยังไม่มีเมนู
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id ?? "uncategorized"} className="mb-5">
                <h2 className="text-base font-semibold text-text-primary mb-1">{cat.name}</h2>
                {cat.items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    qty={getQty(item.id)}
                    onAdd={() => handleAdd(item)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && cartShopId === id && (
        <div className="px-4 py-2.5 pb-3 bg-surface-bg border-t border-border shrink-0">
          <button
            onClick={() => router.push("/cart")}
            className="w-full h-[50px] rounded-card bg-brand-primary text-white flex items-center justify-between px-4"
          >
            <span className="flex items-center gap-2.5 text-sm">
              <span className="bg-white/20 rounded-full min-w-6 h-6 px-2 grid place-items-center font-semibold">
                {cartCount}
              </span>
              <span className="font-semibold">ไปที่ตะกร้า</span>
            </span>
            <span className="text-base font-semibold tabular-nums">
              ฿{cartTotal.toLocaleString("th-TH")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
