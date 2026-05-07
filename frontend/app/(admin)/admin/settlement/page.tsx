"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

type TabKey = "pending" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending",   label: "รอโอน" },
  { key: "completed", label: "โอนแล้ว" },
];

interface SettlementItem {
  id: string;
  recipient_id: string;
  recipient_type: string;
  period_start: string | null;
  period_end: string | null;
  gross_amount: number;
  commission: number;
  net_amount: number;
  status: string;
  paid_at: string | null;
  bank_ref: string | null;
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const s = new Date(start).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
  return `${s}–${e}`;
}

function SkeletonCard() {
  return (
    <div className="bg-surface-card rounded-card border border-border p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-border shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-border rounded w-1/2" />
          <div className="h-3 bg-border rounded w-1/3" />
        </div>
        <div className="w-16 h-6 bg-border rounded" />
      </div>
    </div>
  );
}

export default function AdminSettlementPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settlements", tab],
    queryFn: () => api.getAdminSettlements({ status: tab }) as Promise<ApiResponse<SettlementItem[]>>,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.confirmSettlement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settlements"] }),
  });

  const list = data?.data ?? [];
  const pendingTotal = tab === "pending"
    ? list.reduce((sum, s) => sum + s.net_amount, 0)
    : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-text-primary">การชำระเงิน</div>
          <button 
            onClick={() => api.downloadSettlementsCsv()}
            className="flex items-center gap-2 px-3 py-2 rounded-btn border border-border text-sm text-text-secondary hover:bg-surface-bg transition-colors"
          >
            <Download size={14} />
            ส่งออก CSV
          </button>
        </div>
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
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "pending" && !isLoading && list.length > 0 && (
          <div className="bg-brand-primary rounded-card p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-white/70 mb-1">ยอดรอโอนทั้งหมด</div>
              <div className="text-2xl font-semibold text-white">{formatPrice(pendingTotal)}</div>
            </div>
            <div className="text-xs text-white/70 text-right">
              <div>{list.length} รายการ</div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isLoading ? (
            [1, 2, 3].map((n) => <SkeletonCard key={n} />)
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-text-tertiary text-sm">ไม่มีรายการในหมวดนี้</div>
          ) : (
            list.map((item) => {
              const isConfirming = confirmMutation.isPending && confirmMutation.variables === item.id;
              const isMerchant = item.recipient_type === "merchant";

              return (
                <div key={item.id} className="bg-surface-card rounded-card border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full grid place-items-center text-base font-semibold shrink-0",
                        isMerchant
                          ? "bg-brand-primary-light text-brand-primary"
                          : "bg-brand-secondary-light text-brand-secondary"
                      )}
                    >
                      {isMerchant ? "🏪" : "🛵"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-text-tertiary">
                          {isMerchant ? "ร้านค้า" : "ไรเดอร์"}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        งวด {formatDateRange(item.period_start, item.period_end)}
                      </div>
                      {item.bank_ref && (
                        <div className="text-[11px] text-text-tertiary mt-0.5">ref: {item.bank_ref}</div>
                      )}
                      {item.paid_at && (
                        <div className="text-[11px] text-status-success mt-0.5">
                          โอนแล้ว {new Date(item.paid_at).toLocaleDateString("th-TH")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-text-tertiary">สุทธิ</div>
                        <div className="text-base font-semibold text-text-primary tabular-nums">
                          {formatPrice(item.net_amount)}
                        </div>
                      </div>

                      {tab === "pending" && (
                        isConfirming ? (
                          <div className="w-6 h-6 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <button
                            onClick={() => confirmMutation.mutate(item.id)}
                            className="text-xs font-medium px-3 py-1.5 bg-brand-secondary text-white rounded-full hover:opacity-90 transition-opacity"
                          >
                            ยืนยันโอน
                          </button>
                        )
                      )}

                      {tab === "completed" && (
                        <div className="flex items-center gap-1 text-xs text-status-success font-medium">
                          <CheckCircle2 size={13} />
                          สำเร็จ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount breakdown */}
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-text-tertiary">ยอดขาย</div>
                      <div className="text-xs font-semibold tabular-nums">{formatPrice(item.gross_amount)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-tertiary">ค่าธรรมเนียม</div>
                      <div className="text-xs font-semibold tabular-nums text-status-danger">
                        -{formatPrice(item.commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-tertiary">โอนให้</div>
                      <div className="text-xs font-semibold tabular-nums text-status-success">
                        {formatPrice(item.net_amount)}
                      </div>
                    </div>
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
