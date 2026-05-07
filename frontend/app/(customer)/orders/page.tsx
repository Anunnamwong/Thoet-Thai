"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface OrderListItem {
  id: string;
  order_number: string;
  shop_id: string;
  shop_name: string | null;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  item_count: number;
  created_at: string;
}

type TabKey = "all" | "active" | "done";

const ACTIVE_STATUSES = new Set(["pending_payment", "paid", "preparing", "ready_for_pickup", "rider_assigned", "picked_up"]);
const DONE_STATUSES = new Set(["delivered", "cancelled", "refunded"]);

const STATUS_DISPLAY: Record<string, { label: string; textClass: string; bgClass: string }> = {
  pending_payment:  { label: "รอชำระเงิน",      textClass: "text-status-warning",   bgClass: "bg-status-warning-bg" },
  paid:             { label: "รับออเดอร์แล้ว",   textClass: "text-brand-primary",    bgClass: "bg-brand-primary-light" },
  preparing:        { label: "กำลังทำอาหาร",     textClass: "text-brand-primary",    bgClass: "bg-brand-primary-light" },
  ready_for_pickup: { label: "รอไรเดอร์",        textClass: "text-brand-secondary",  bgClass: "bg-brand-secondary-light" },
  rider_assigned:   { label: "ไรเดอร์รับงานแล้ว", textClass: "text-brand-secondary", bgClass: "bg-brand-secondary-light" },
  picked_up:        { label: "กำลังส่ง",         textClass: "text-brand-primary",    bgClass: "bg-brand-primary-light" },
  delivered:        { label: "สำเร็จ",           textClass: "text-status-success",   bgClass: "bg-status-success-bg" },
  cancelled:        { label: "ยกเลิก",           textClass: "text-status-danger",    bgClass: "bg-status-danger-bg" },
  refunded:         { label: "คืนเงินแล้ว",      textClass: "text-text-secondary",   bgClass: "bg-surface-bg" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
  );
}

const TABS = [
  { id: "all" as const, label: "ทั้งหมด" },
  { id: "active" as const, label: "กำลังดำเนินการ" },
  { id: "done" as const, label: "เสร็จสิ้น" },
];

function OrderSkeleton() {
  return (
    <div className="bg-surface-card border border-border rounded-card p-3.5 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-4 bg-border rounded w-1/3" />
        <div className="h-4 bg-border rounded w-1/5" />
      </div>
      <div className="h-3 bg-border rounded w-1/2 mb-2" />
      <div className="flex justify-between">
        <div className="h-3 bg-border rounded w-1/4" />
        <div className="h-3 bg-border rounded w-1/5" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,
  });

  const all = data?.data ?? [];
  const list =
    tab === "all"
      ? all
      : tab === "active"
      ? all.filter((o) => ACTIVE_STATUSES.has(o.status))
      : all.filter((o) => DONE_STATUSES.has(o.status));

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="คำสั่งซื้อของฉัน" />

      <div className="flex gap-1 px-4 py-3 border-b border-border shrink-0">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-3.5 py-2 rounded-full text-xs font-medium border",
              tab === id
                ? "bg-text-primary text-white border-text-primary"
                : "bg-transparent text-text-primary border-border"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 flex flex-col gap-2.5">
        {isLoading ? (
          [1, 2, 3].map((n) => <OrderSkeleton key={n} />)
        ) : list.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="text-5xl mb-2">📋</div>
            <div className="text-base font-semibold text-text-primary mb-1">ยังไม่มีคำสั่งซื้อ</div>
            <div className="text-sm text-text-secondary">เริ่มสั่งจากร้านโปรดได้เลยครับ</div>
          </div>
        ) : (
          list.map((order) => {
            const s = STATUS_DISPLAY[order.status] ?? {
              label: order.status,
              textClass: "text-text-secondary",
              bgClass: "bg-surface-bg",
            };
            return (
              <button
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="bg-surface-card border border-border rounded-card p-3.5 text-left"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-text-primary">
                    {order.shop_name ?? "ร้านค้า"}
                  </span>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md", s.textClass, s.bgClass)}>
                    {s.label}
                  </span>
                </div>
                <div className="text-xs text-text-secondary mb-2">
                  {order.item_count} รายการ · #{order.order_number}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">{formatDate(order.created_at)}</span>
                  <span className="font-semibold text-text-primary tabular-nums">
                    ฿{order.total.toLocaleString("th-TH")}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
