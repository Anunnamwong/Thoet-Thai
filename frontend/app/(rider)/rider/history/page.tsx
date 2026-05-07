"use client";

import { useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Store, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface HistoryItem {
  id: string;
  order_number: string | null;
  shop_name: string | null;
  customer_address: string | null;
  status: string;
  delivery_fee: number;
  distance_km: string | null;
  delivered_at: string | null;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function SkeletonRow() {
  return (
    <div className="bg-surface-card rounded-card border border-border p-3.5 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-border rounded w-1/3" />
          <div className="h-4 bg-border rounded w-2/3" />
          <div className="h-3 bg-border rounded w-1/2" />
        </div>
        <div className="text-right space-y-2">
          <div className="h-6 bg-border rounded w-12" />
          <div className="h-3 bg-border rounded w-10" />
        </div>
      </div>
    </div>
  );
}

export default function RiderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["rider-history"],
    queryFn: () => api.getRiderHistory() as Promise<ApiResponse<HistoryItem[]>>,
  });

  const jobs = data?.data ?? [];
  const total = jobs.reduce((s, j) => s + j.delivery_fee, 0);

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader
        title="งานของฉัน"
        sub={
          isLoading
            ? "กำลังโหลด..."
            : `วันนี้ · ${jobs.length} งาน · ฿${total.toLocaleString("th-TH")}`
        }
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 flex flex-col gap-2">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-sm text-text-secondary">ยังไม่มีประวัติงาน</div>
          </div>
        ) : (
          jobs.map((j) => (
            <div key={j.id} className="bg-surface-card rounded-card border border-border p-3.5">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-secondary font-mono">
                      #{j.order_number ?? "—"}
                    </span>
                    <span className="text-xs text-text-tertiary">· {formatTime(j.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-1">
                    <Store size={14} className="text-brand-primary shrink-0" />
                    <span className="truncate">{j.shop_name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin size={13} className="text-brand-secondary shrink-0" />
                    <span className="truncate">{j.customer_address ?? "—"}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2.5">
                  <div className="text-lg font-bold text-brand-primary tabular-nums">
                    ฿{j.delivery_fee}
                  </div>
                  {j.distance_km && (
                    <div className="text-[11px] text-text-tertiary tabular-nums mt-0.5">
                      {j.distance_km} กม.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
