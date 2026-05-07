"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

type TabKey = "pending" | "active" | "inactive";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending",  label: "รอการอนุมัติ" },
  { key: "active",   label: "ใช้งานได้" },
  { key: "inactive", label: "ระงับ" },
];

interface RiderItem {
  user_id: string;
  display_name: string;
  phone: string | null;
  vehicle_type: string | null;
  license_plate: string | null;
  status: string;
  approved_at: string | null;
  total_deliveries: number;
  bank_name: string | null;
  bank_account: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

function SkeletonCard() {
  return (
    <div className="bg-surface-card rounded-card border border-border p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-border shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-border rounded w-1/2" />
          <div className="h-3 bg-border rounded w-1/3" />
          <div className="h-3 bg-border rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function AdminRidersPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const queryClient = useQueryClient();

  const params: Record<string, string> =
    tab === "pending" ? { approved: "false" } : { approved: "true" };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-riders", tab],
    queryFn: () => api.getAdminRiders(params) as Promise<ApiResponse<RiderItem[]>>,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => api.approveRider(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-riders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const allRiders = data?.data ?? [];
  const list =
    tab === "inactive"
      ? allRiders.filter((r) => r.status === "offline" && r.total_deliveries === 0)
      : allRiders;

  const onlineCount = allRiders.filter((r) => r.status === "online").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card shrink-0">
        <div className="text-lg font-semibold text-text-primary mb-3">จัดการไรเดอร์</div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-brand-primary text-white"
                  : "bg-surface-bg text-text-secondary border border-border hover:border-brand-primary hover:text-brand-primary"
              )}
            >
              {t.label}
              {t.key === "pending" && !isLoading && tab === "pending" && allRiders.length > 0 && (
                <span className="ml-1.5 bg-white text-brand-primary rounded-full px-1.5 text-[10px] font-semibold">
                  {allRiders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "active" && !isLoading && (
          <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
            <Bike size={15} />
            <span>ออนไลน์ {onlineCount} / {allRiders.length} คน</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isLoading ? (
            [1, 2, 3].map((n) => <SkeletonCard key={n} />)
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-text-tertiary text-sm">ไม่มีไรเดอร์ในหมวดนี้</div>
          ) : (
            list.map((rider) => {
              const isOnline = rider.status === "online";
              const isActioning = approveMutation.isPending && approveMutation.variables === rider.user_id;

              return (
                <div key={rider.user_id} className="bg-surface-card rounded-card border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-brand-secondary-light text-brand-secondary grid place-items-center text-lg font-semibold">
                        {rider.display_name[0]}
                      </div>
                      {rider.approved_at && (
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-card",
                            isOnline ? "bg-status-success" : "bg-border"
                          )}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary mb-0.5">
                        {rider.display_name}
                      </div>
                      {rider.phone && (
                        <div className="text-xs text-text-secondary">{rider.phone}</div>
                      )}
                      {rider.vehicle_type && rider.license_plate && (
                        <div className="text-xs text-text-secondary mt-0.5">
                          {rider.vehicle_type} · {rider.license_plate}
                        </div>
                      )}
                      <div className="text-[11px] text-text-tertiary mt-0.5">
                        สมัคร {formatDate(rider.created_at)}
                      </div>
                      {rider.total_deliveries > 0 && (
                        <div className="text-xs text-text-secondary mt-1">
                          {rider.total_deliveries.toLocaleString("th-TH")} งาน
                        </div>
                      )}
                    </div>

                    {tab === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        {isActioning ? (
                          <div className="w-9 h-9 grid place-items-center">
                            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <button
                            onClick={() => approveMutation.mutate(rider.user_id)}
                            className="w-9 h-9 rounded-full bg-status-success text-white grid place-items-center hover:opacity-90 transition-opacity"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    )}

                    {tab === "active" && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
                          isOnline
                            ? "bg-status-success-bg text-status-success"
                            : "bg-surface-bg text-text-tertiary border border-border"
                        )}
                      >
                        {isOnline ? "ออนไลน์" : "ออฟไลน์"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
