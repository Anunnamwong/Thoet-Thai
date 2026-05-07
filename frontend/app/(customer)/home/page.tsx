"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MapPin, Bell, Search, SlidersHorizontal, Clock, Bike, X } from "lucide-react";
import type { Shop, ApiResponse } from "@/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ── หมวดหมู่ ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: "🍽" },
  { id: "ข้าว", label: "ข้าว", icon: "🍚" },
  { id: "ก๋วยเตี๋ยว", label: "ก๋วยเตี๋ยว", icon: "🍜" },
  { id: "อาหารตาม สั่ง", label: "ตามสั่ง", icon: "🥘" },
  { id: "เครื่องดื่ม", label: "เครื่องดื่ม", icon: "🧋" },
  { id: "ขนม", label: "ขนม", icon: "🍡" },
  { id: "ส้มตำ", label: "ส้มตำ", icon: "🌶" },
] as const;

// ── Shop Card ──────────────────────────────────────────────────
function ShopCard({ shop, onClick }: { shop: Shop; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-card rounded-card border border-border overflow-hidden active:scale-[0.98] transition-transform"
    >
      {/* Cover */}
      <div className="relative h-[132px] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 overflow-hidden">
        {shop.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.cover_image_url} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/90 flex items-center justify-center text-2xl font-semibold text-text-secondary">
              {shop.name.slice(0, 1)}
            </div>
          </div>
        )}
        {!shop.is_open && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <span className="text-white text-sm font-semibold">ปิดอยู่</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-text-primary leading-tight flex-1 truncate">
            {shop.name}
          </h3>
          {!shop.is_open && (
            <span className="text-xs text-status-danger font-medium shrink-0">ปิด</span>
          )}
        </div>
        {shop.description && (
          <p className="text-sm text-text-secondary truncate mb-2">{shop.description}</p>
        )}
        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock size={12} strokeWidth={2} />
            {shop.avg_cooking_time} นาที
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-border" />
          <span className="flex items-center gap-1">
            <Bike size={13} strokeWidth={2} />
            ฿{shop.delivery_fee}
          </span>
          {shop.minimum_order > 0 && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-border" />
              <span>ขั้นต่ำ ฿{shop.minimum_order}</span>
            </>
          )}
        </div>
        {shop.cuisine_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {shop.cuisine_types.slice(0, 3).map((t) => (
              <span key={t} className="text-[11px] bg-surface-bg text-text-secondary px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Shop Skeleton ──────────────────────────────────────────────
function ShopSkeleton() {
  return (
    <div className="bg-surface-card rounded-card border border-border overflow-hidden">
      <div className="h-[132px] bg-border animate-pulse" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-border rounded animate-pulse w-2/3" />
        <div className="h-3 bg-border rounded animate-pulse w-1/2" />
        <div className="h-3 bg-border rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CustomerHomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params: Record<string, string> = { page: "1", limit: "50" };
  if (activeCategory !== "all") params.category = activeCategory;
  if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

  const { data, isLoading } = useQuery({
    queryKey: ["shops", activeCategory, debouncedSearch],
    queryFn: () => api.getShops(params) as Promise<ApiResponse<Shop[]>>,
    placeholderData: (prev) => prev,
  });

  const shops = data?.data ?? [];
  const openShops = shops.filter((s) => s.is_open);
  const closedShops = shops.filter((s) => !s.is_open);

  return (
    <div className="flex flex-col h-full bg-surface-bg">
      {/* Top Bar */}
      <div className="px-4 pt-12 pb-3 flex items-center justify-between bg-surface-bg">
        <button className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-[10px] bg-brand-primary/10 text-brand-primary grid place-items-center shrink-0">
            <MapPin size={18} strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase">
              ส่งไปที่
            </span>
            <span className="text-sm font-semibold text-text-primary truncate max-w-[180px]">
              ตำบลเทอดไทย
            </span>
          </div>
        </button>
        <button
          className="w-10 h-10 rounded-[12px] bg-surface-card border border-border grid place-items-center text-text-primary relative"
          aria-label="การแจ้งเตือน"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-primary border-2 border-surface-card" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="flex-1 h-11 rounded-[12px] bg-surface-card border border-border flex items-center px-3.5 gap-2.5">
          <Search size={18} className="text-text-secondary shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหาร้านหรือเมนู เช่น ข้าวซอย…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} className="text-text-secondary">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          className="w-11 h-11 rounded-[12px] bg-text-primary text-white grid place-items-center shrink-0"
          aria-label="ตัวกรอง"
        >
          <SlidersHorizontal size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Promo Banner */}
        <div className="px-4 pb-4">
          <div className="relative bg-brand-secondary rounded-[14px] p-4 text-white overflow-hidden">
            <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute right-8 -bottom-7 w-20 h-20 rounded-full bg-white/5" />
            <div className="text-[11px] font-medium tracking-widest uppercase opacity-75 mb-1">
              เทอดไทย โซนกลาง
            </div>
            <div className="text-base font-semibold leading-snug mb-1">
              จ่ายปลายทางก็ได้ ส่งไวใน 30 นาที
            </div>
            <div className="text-[13px] opacity-85">
              ค่าส่งเริ่มต้น ฿15 — เงินหมุนในชุมชนเรา
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "shrink-0 h-[38px] px-3.5 rounded-full flex items-center gap-1.5 text-sm font-medium border whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-text-primary text-white border-text-primary"
                      : "bg-surface-card text-text-primary border-border"
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shop List */}
        {isLoading ? (
          <div className="px-4 flex flex-col gap-3">
            {[1, 2, 3].map((n) => <ShopSkeleton key={n} />)}
          </div>
        ) : shops.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-3">🍽</div>
            <div className="text-base font-semibold text-text-primary mb-1">
              {searchInput ? "ไม่พบร้านที่ค้นหา" : "ยังไม่มีร้านในพื้นที่"}
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              {searchInput
                ? "ลองค้นด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่"
                : "กำลังเพิ่มร้านค้าเร็วๆ นี้ครับ"}
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            {/* Open shops */}
            {openShops.length > 0 && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">ร้านในเทอดไทย</h2>
                    <p className="text-xs text-text-secondary mt-0.5">{openShops.length} ร้านเปิดอยู่ตอนนี้</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {openShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onClick={() => router.push(`/shop/${shop.id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Closed shops */}
            {closedShops.length > 0 && (
              <div className={openShops.length > 0 ? "mt-6" : ""}>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-text-primary">ปิดอยู่ตอนนี้</h2>
                  <p className="text-xs text-text-secondary mt-0.5">กลับมาดูใหม่เมื่อร้านเปิด</p>
                </div>
                <div className="flex flex-col gap-3">
                  {closedShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onClick={() => router.push(`/shop/${shop.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-text-tertiary mt-6">
              แสดงร้านในตำบลเทอดไทย
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
