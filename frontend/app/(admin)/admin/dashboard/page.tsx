"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, TrendingUp, ShoppingBag, Bike, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardStats {
  orders_today: number;
  revenue_today: number;
  online_riders: number;
  total_riders: number;
  pending_approvals: number;
  pending_merchants: number;
  pending_riders: number;
  recent_orders: {
    id: string;
    order_number: string;
    shop_id: string;
    status: string;
    total: number;
    payment_method: string;
    created_at: string;
  }[];
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending_payment:  { label: "รอชำระ",    cls: "text-status-warning" },
  paid:             { label: "รับแล้ว",   cls: "text-brand-primary" },
  preparing:        { label: "กำลังทำ",   cls: "text-brand-primary" },
  ready_for_pickup: { label: "รอไรเดอร์", cls: "text-brand-secondary" },
  rider_assigned:   { label: "มีไรเดอร์", cls: "text-brand-secondary" },
  picked_up:        { label: "กำลังส่ง",  cls: "text-brand-primary" },
  delivered:        { label: "สำเร็จ",    cls: "text-status-success" },
  cancelled:        { label: "ยกเลิก",    cls: "text-status-danger" },
};

function StatCard({
  label,
  value,
  sub,
  Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-surface-card rounded-card border border-border p-4 flex items-start gap-3">
      <div className={cn("w-10 h-10 rounded-[10px] grid place-items-center shrink-0", bg)}>
        <Icon size={18} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-text-secondary mb-0.5">{label}</div>
        <div className="text-xl font-bold text-text-primary tabular-nums">{value}</div>
        <div className="text-[11px] text-text-tertiary mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-card rounded-card border border-border p-4 flex items-start gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-[10px] bg-border shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-border rounded w-1/2" />
        <div className="h-5 bg-border rounded w-1/3" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.getAdminDashboard() as Promise<ApiResponse<DashboardStats>>,
  });

  const stats = data?.data;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card shrink-0 flex items-center justify-between">
        <div className="text-lg font-semibold text-text-primary">ภาพรวม</div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-full border border-border grid place-items-center text-text-secondary hover:bg-surface-bg transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {isLoading ? (
            [1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)
          ) : (
            <>
              <StatCard
                label="ออเดอร์วันนี้"
                value={String(stats?.orders_today ?? 0)}
                sub="รายการทั้งหมด"
                Icon={ShoppingBag}
                color="text-brand-primary"
                bg="bg-brand-primary-light"
              />
              <StatCard
                label="รายได้วันนี้"
                value={formatPrice(stats?.revenue_today ?? 0)}
                sub="สุทธิจากออเดอร์ส่งแล้ว"
                Icon={TrendingUp}
                color="text-status-success"
                bg="bg-status-success-bg"
              />
              <StatCard
                label="ไรเดอร์ออนไลน์"
                value={`${stats?.online_riders ?? 0} / ${stats?.total_riders ?? 0}`}
                sub="คนที่พร้อมรับงาน"
                Icon={Bike}
                color="text-brand-secondary"
                bg="bg-brand-secondary-light"
              />
              <StatCard
                label="รอการอนุมัติ"
                value={String(stats?.pending_approvals ?? 0)}
                sub={`ร้านค้า ${stats?.pending_merchants ?? 0}, ไรเดอร์ ${stats?.pending_riders ?? 0}`}
                Icon={AlertCircle}
                color="text-status-warning"
                bg="bg-status-warning-bg"
              />
            </>
          )}
        </div>

        {/* Recent orders */}
        <div className="text-sm font-semibold text-text-primary mb-3">ออเดอร์ล่าสุด</div>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-surface-card rounded-card border border-border p-3.5 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-border rounded w-1/4" />
                  <div className="h-4 bg-border rounded w-1/6" />
                </div>
                <div className="h-3 bg-border rounded w-1/3" />
              </div>
            ))
          ) : (stats?.recent_orders ?? []).length === 0 ? (
            <div className="py-8 text-center text-sm text-text-secondary">ยังไม่มีออเดอร์</div>
          ) : (stats?.recent_orders ?? []).map((o) => {
              const s = STATUS_LABEL[o.status];
              const t = new Date(o.created_at);
              
              // Highlight stuck orders (> 30 mins and not done)
              const createdAt = new Date(o.created_at).getTime();
              const diffMins = (new Date().getTime() - createdAt) / (1000 * 60);
              const isStuck = diffMins > 30 && !["delivered", "cancelled"].includes(o.status);

              return (
                <div 
                  key={o.id} 
                  className={cn(
                    "bg-surface-card rounded-card border p-3.5 transition-colors",
                    isStuck ? "border-status-danger bg-status-danger-bg/20" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary font-mono">
                        #{o.order_number}
                      </span>
                      {isStuck && (
                        <span className="px-1.5 py-0.5 rounded-md bg-status-danger text-white text-[9px] font-bold animate-pulse">
                          ล่าช้า ({Math.floor(diffMins)} นาที)
                        </span>
                      )}
                    </div>
                    <span className={cn("text-xs font-semibold", s?.cls ?? "text-text-secondary")}>
                      {s?.label ?? o.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>
                      {t.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-semibold text-text-primary tabular-nums">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
