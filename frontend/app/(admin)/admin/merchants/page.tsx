"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

type TabKey = "pending_approval" | "active" | "suspended";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending_approval", label: "รอการอนุมัติ" },
  { key: "active",           label: "เปิดใช้งาน" },
  { key: "suspended",        label: "ระงับ" },
];

interface MerchantItem {
  id: string;
  name: string;
  status: string;
  is_open: boolean;
  full_address: string | null;
  phone: string | null;
  cuisine_types: string[];
  bank_name: string | null;
  bank_account: string | null;
  approved_at: string | null;
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
          <div className="h-4 bg-border rounded w-2/3" />
          <div className="h-3 bg-border rounded w-1/2" />
          <div className="h-3 bg-border rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function AdminMerchantsPage() {
  const [tab, setTab] = useState<TabKey>("pending_approval");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-merchants", tab],
    queryFn: () => api.getAdminMerchants({ status: tab }) as Promise<ApiResponse<MerchantItem[]>>,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.suspendMerchant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-merchants"] }),
  });

  const list = data?.data ?? [];
  const pendingCount = tab === "pending_approval" ? list.length : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card shrink-0">
        <div className="text-lg font-semibold text-text-primary mb-3">จัดการร้านค้า</div>
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
              {t.key === "pending_approval" && pendingCount > 0 && (
                <span className="ml-1.5 bg-white text-brand-primary rounded-full px-1.5 text-[10px] font-semibold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            [1, 2, 3].map((n) => <SkeletonCard key={n} />)
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-text-tertiary text-sm">
              ไม่มีร้านค้าในหมวดนี้
            </div>
          ) : (
            list.map((merchant) => {
              const isActioning =
                (approveMutation.isPending && approveMutation.variables === merchant.id) ||
                (suspendMutation.isPending && suspendMutation.variables === merchant.id);

              return (
                <div key={merchant.id} className="bg-surface-card rounded-card border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand-primary-light text-brand-primary grid place-items-center text-lg font-semibold shrink-0">
                      {merchant.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-text-primary">{merchant.name}</span>
                        {merchant.cuisine_types.length > 0 && (
                          <span className="text-[11px] bg-surface-bg text-text-tertiary px-2 py-0.5 rounded-full border border-border">
                            {merchant.cuisine_types[0]}
                          </span>
                        )}
                      </div>
                      {merchant.phone && (
                        <div className="text-xs text-text-secondary">{merchant.phone}</div>
                      )}
                      {merchant.full_address && (
                        <div className="text-xs text-text-secondary truncate">{merchant.full_address}</div>
                      )}
                      <div className="text-[11px] text-text-tertiary mt-0.5">
                        สมัคร {formatDate(merchant.created_at)}
                      </div>
                    </div>

                    {tab === "pending_approval" && (
                      <div className="flex gap-2 shrink-0">
                        {isActioning ? (
                          <div className="w-9 h-9 grid place-items-center">
                            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => suspendMutation.mutate(merchant.id)}
                              className="w-9 h-9 rounded-full border border-status-danger text-status-danger grid place-items-center hover:bg-status-danger-bg transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => approveMutation.mutate(merchant.id)}
                              className="w-9 h-9 rounded-full bg-status-success text-white grid place-items-center hover:opacity-90 transition-opacity"
                            >
                              <Check size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {tab === "active" && (
                      <button
                        onClick={() => suspendMutation.mutate(merchant.id)}
                        disabled={isActioning}
                        className="text-xs text-status-danger font-medium px-3 py-1.5 border border-status-danger rounded-full hover:bg-status-danger-bg transition-colors shrink-0 disabled:opacity-50"
                      >
                        ระงับ
                      </button>
                    )}

                    {tab === "suspended" && (
                      <button
                        onClick={() => approveMutation.mutate(merchant.id)}
                        disabled={isActioning}
                        className="text-xs text-brand-primary font-medium px-3 py-1.5 border border-brand-primary rounded-full hover:bg-brand-primary-light transition-colors shrink-0 disabled:opacity-50"
                      >
                        {isActioning ? "..." : "คืนสถานะ"}
                      </button>
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
