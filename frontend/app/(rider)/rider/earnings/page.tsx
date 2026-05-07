"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface EarningDay {
  date: string;
  amount: number;
  jobs: number;
}

interface EarningsOut {
  total_today: number;
  total_week: number;
  total_month: number;
  total_deliveries: number;
  days: EarningDay[];
  next_payout: number;
  next_payout_date: string | null;
}

type Period = "today" | "week" | "month";

const DAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function formatPayoutDate(iso: string | null) {
  if (!iso) return "เร็วๆ นี้";
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long" });
}

export default function RiderEarningsPage() {
  const [period, setPeriod] = useState<Period>("today");

  const { data, isLoading } = useQuery({
    queryKey: ["rider-earnings"],
    queryFn: () => api.getRiderEarnings() as Promise<ApiResponse<EarningsOut>>,
  });

  const earnings = data?.data;

  const gross =
    period === "today"
      ? (earnings?.total_today ?? 0)
      : period === "week"
      ? (earnings?.total_week ?? 0)
      : (earnings?.total_month ?? 0);

  const jobs = earnings?.total_deliveries ?? 0;

  // days array from backend = last 7 days
  const days = earnings?.days ?? [];
  const max = days.length > 0 ? Math.max(...days.map((d) => d.amount), 1) : 1;

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="รายได้ของฉัน" />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {/* Period tabs */}
        <div className="flex gap-1 bg-surface-card p-1 rounded-[10px] border border-border mb-3.5">
          {(["today", "week", "month"] as Period[]).map((id, i) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={cn(
                "flex-1 h-11 rounded-lg text-sm font-semibold",
                period === id ? "bg-text-primary text-white" : "text-text-primary"
              )}
            >
              {["วันนี้", "7 วัน", "30 วัน"][i]}
            </button>
          ))}
        </div>

        {/* Big green card */}
        {isLoading ? (
          <div className="bg-border rounded-modal p-5 mb-3 animate-pulse h-[140px]" />
        ) : (
          <div className="bg-brand-secondary text-white rounded-modal p-5 mb-3">
            <div className="text-sm opacity-90 mb-1">รายได้รวม</div>
            <div className="text-[40px] font-extrabold tabular-nums leading-tight">
              ฿{gross.toLocaleString("th-TH")}
            </div>
            <div className="flex gap-4 mt-3.5 pt-3.5 border-t border-white/25 text-sm">
              <div>
                <div className="opacity-85 mb-0.5">งานทั้งหมด</div>
                <div className="text-lg font-bold tabular-nums">{jobs}</div>
              </div>
              <div>
                <div className="opacity-85 mb-0.5">โอนถัดไป</div>
                <div className="text-lg font-bold tabular-nums">
                  ฿{(earnings?.next_payout ?? 0).toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bar chart — week view from backend days data */}
        {period === "week" && (
          <div className="bg-surface-card rounded-modal border border-border p-4 mb-3">
            <div className="text-sm font-semibold text-text-primary mb-3.5">7 วันที่ผ่านมา</div>
            {isLoading ? (
              <div className="h-[130px] flex items-end gap-1.5">
                {[60, 40, 80, 55, 90, 30, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-border rounded-t-[4px] animate-pulse" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between h-[130px] gap-1.5">
                {days.map((d, idx) => {
                  const h = max > 0 ? (d.amount / max) * 100 : 0;
                  const isToday = idx === days.length - 1;
                  const dayOfWeek = new Date(d.date).getDay();
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="text-[10px] text-text-secondary font-medium tabular-nums"
                        style={{ visibility: d.amount > 0 ? "visible" : "hidden" }}
                      >
                        {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                      </div>
                      <div className="w-full flex-1 flex flex-col justify-end">
                        <div
                          className={cn(
                            "w-full rounded-t-[4px]",
                            isToday
                              ? "bg-brand-secondary"
                              : "bg-status-success-bg border-[1.5px] border-brand-secondary"
                          )}
                          style={{ height: `${h}%`, minHeight: d.amount > 0 ? 6 : 0 }}
                        />
                      </div>
                      <div className={cn("text-xs font-medium", isToday ? "text-brand-secondary font-bold" : "text-text-secondary")}>
                        {DAY_LABELS[dayOfWeek]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Next payout */}
        {!isLoading && (
          <div className="bg-surface-card rounded-card border border-border p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-status-success-bg text-status-success grid place-items-center text-lg shrink-0">
              🏦
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary">
                โอนถัดไป ฿{(earnings?.next_payout ?? 0).toLocaleString("th-TH")}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                วันที่ {formatPayoutDate(earnings?.next_payout_date ?? null)}
              </div>
            </div>
            <ChevronRight size={18} className="text-text-secondary shrink-0" />
          </div>
        )}
      </div>

    </div>
  );
}
