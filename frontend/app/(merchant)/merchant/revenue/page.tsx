"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface DayRevenue { date: string; gross: number }
interface TopItem    { name: string; qty: number; total: number }
interface Settlement {
  id: string;
  period_start: string | null;
  period_end:   string | null;
  gross: number;
  fee:   number;
  net:   number;
  status: string;
  paid_at: string | null;
}
interface PeriodStats { gross: number; orders: number; avg: number }
interface RevenueOut {
  today: PeriodStats;
  week:  PeriodStats;
  month: PeriodStats;
  days:  DayRevenue[];
  top_items:   TopItem[];
  settlements: Settlement[];
  next_payout:      number;
  next_payout_date: string | null;
}

type Period = "today" | "week" | "month";

const DAY_LABELS: Record<number, string> = { 0: "อา", 1: "จ", 2: "อ", 3: "พ", 4: "พฤ", 5: "ศ", 6: "ส" };

function formatPeriod(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  return `${fmt(s)}–${fmt(e)}`;
}

function formatPayoutDate(iso: string | null) {
  if (!iso) return "เร็วๆ นี้";
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "2-digit" });
}

function SkeletonBlock({ h = "h-24" }: { h?: string }) {
  return <div className={cn("bg-border rounded-modal animate-pulse", h)} />;
}

function SettlementsView({
  settlements,
  nextPayout,
  nextPayoutDate,
  onBack,
}: {
  settlements: Settlement[];
  nextPayout: number;
  nextPayoutDate: string | null;
  onBack: () => void;
}) {
  const paid = settlements.filter((s) => s.status !== "pending");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="ประวัติการโอนเงิน" onBack={onBack} />
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {nextPayout > 0 && (
          <div className="bg-status-success-bg rounded-card p-3.5 mb-3.5">
            <div className="text-xs text-status-success font-semibold mb-1">ครั้งถัดไป</div>
            <div className="text-2xl font-bold text-status-success tabular-nums">
              ฿{nextPayout.toLocaleString("th-TH")}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              จะโอนวันที่ {formatPayoutDate(nextPayoutDate)}
            </div>
          </div>
        )}

        {paid.length > 0 && (
          <div className="text-xs text-text-secondary font-medium mb-2 pl-1">โอนแล้ว</div>
        )}
        <div className="flex flex-col gap-2">
          {paid.map((s) => (
            <div key={s.id} className="bg-surface-card rounded-card border border-border p-3.5">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {formatPeriod(s.period_start, s.period_end)}
                  </div>
                  {s.paid_at && (
                    <div className="text-xs text-text-secondary mt-0.5">
                      โอนเมื่อ {new Date(s.paid_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </div>
                  )}
                </div>
                <span className="bg-status-success-bg text-status-success text-xs font-semibold px-2 py-0.5 rounded-md">
                  โอนแล้ว
                </span>
              </div>
              {[
                { label: "ยอดขาย",             value: `฿${s.gross.toLocaleString("th-TH")}`,     cls: "" },
                { label: "ค่าธรรมเนียม (10%)", value: `−฿${s.fee.toLocaleString("th-TH")}`,      cls: "text-status-danger" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between text-sm py-1">
                  <span className="text-text-secondary">{label}</span>
                  <span className={cn("tabular-nums", cls)}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold py-2 border-t border-border mt-1">
                <span className="text-text-primary">โอนเข้าบัญชี</span>
                <span className="tabular-nums text-status-success">฿{s.net.toLocaleString("th-TH")}</span>
              </div>
            </div>
          ))}

          {paid.length === 0 && (
            <div className="py-12 text-center text-sm text-text-secondary">ยังไม่มีประวัติการโอนเงิน</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MerchantRevenuePage() {
  const [period, setPeriod] = useState<Period>("week");
  const [showSettlements, setShowSettlements] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-revenue"],
    queryFn: () => api.getMerchantRevenue() as Promise<ApiResponse<RevenueOut>>,
  });

  const rev = data?.data;
  const stats = rev ? rev[period] : null;
  const days  = rev?.days ?? [];
  const max   = days.length > 0 ? Math.max(...days.map((d) => d.gross), 1) : 1;

  if (showSettlements && rev) {
    return (
      <SettlementsView
        settlements={rev.settlements}
        nextPayout={rev.next_payout}
        nextPayoutDate={rev.next_payout_date}
        onBack={() => setShowSettlements(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="รายได้" />
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">

        {/* Period tabs */}
        <div className="flex gap-1 bg-surface-card p-1 rounded-[10px] border border-border mb-3.5">
          {(["today", "week", "month"] as Period[]).map((id, i) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={cn(
                "flex-1 h-10 rounded-lg text-sm font-semibold",
                period === id ? "bg-text-primary text-white" : "text-text-primary"
              )}
            >
              {["วันนี้", "7 วัน", "30 วัน"][i]}
            </button>
          ))}
        </div>

        {/* Big number */}
        {isLoading ? (
          <SkeletonBlock h="h-[120px] mb-3" />
        ) : (
          <div className="bg-surface-card rounded-modal border border-border p-4 mb-3">
            <div className="text-xs text-text-secondary mb-1">ยอดขายรวม</div>
            <div className="text-[36px] font-bold text-brand-primary tabular-nums leading-tight">
              ฿{(stats?.gross ?? 0).toLocaleString("th-TH")}
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-border text-sm">
              <div>
                <div className="text-text-secondary mb-0.5">ออเดอร์</div>
                <div className="text-base font-semibold tabular-nums">{stats?.orders ?? 0}</div>
              </div>
              <div>
                <div className="text-text-secondary mb-0.5">เฉลี่ย/ออเดอร์</div>
                <div className="text-base font-semibold tabular-nums">฿{stats?.avg ?? 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bar chart — week only */}
        {period === "week" && (
          <div className="bg-surface-card rounded-modal border border-border p-4 mb-3">
            <div className="text-sm font-semibold text-text-primary mb-3.5">รายได้ 7 วันที่ผ่านมา</div>
            {isLoading ? (
              <div className="h-[140px] flex items-end gap-1.5">
                {[60, 40, 80, 55, 90, 30, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-border rounded-t-[4px] animate-pulse" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between h-[140px] gap-1.5">
                {days.map((d, idx) => {
                  const h = max > 0 ? (d.gross / max) * 100 : 0;
                  const isToday = idx === days.length - 1;
                  const dow = new Date(d.date).getDay();
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="text-[10px] text-text-secondary tabular-nums font-medium"
                        style={{ visibility: d.gross > 0 ? "visible" : "hidden" }}
                      >
                        {d.gross >= 1000 ? `${(d.gross / 1000).toFixed(1)}k` : d.gross}
                      </div>
                      <div className="w-full flex-1 flex flex-col justify-end">
                        <div
                          className={cn(
                            "w-full rounded-t-[4px]",
                            isToday
                              ? "bg-brand-primary"
                              : "bg-status-success-bg border-[1.5px] border-status-success"
                          )}
                          style={{ height: `${h}%`, minHeight: d.gross > 0 ? 6 : 0 }}
                        />
                      </div>
                      <div className={cn("text-xs font-medium", isToday ? "text-brand-primary font-semibold" : "text-text-secondary")}>
                        {DAY_LABELS[dow] ?? ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Top items */}
        <div className="bg-surface-card rounded-modal border border-border p-4 mb-3">
          <div className="text-sm font-semibold text-text-primary mb-2.5">เมนูขายดี (30 วัน)</div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-border shrink-0" />
                  <div className="flex-1 h-4 bg-border rounded" />
                  <div className="w-16 h-4 bg-border rounded" />
                </div>
              ))}
            </div>
          ) : (rev?.top_items ?? []).length === 0 ? (
            <div className="py-4 text-center text-sm text-text-secondary">ยังไม่มีข้อมูล</div>
          ) : (
            (rev?.top_items ?? []).map((m, i) => (
              <div key={m.name} className={cn("flex items-center gap-3 py-2", i > 0 && "border-t border-border")}>
                <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary grid place-items-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 text-sm font-medium text-text-primary">{m.name}</div>
                <div className="text-xs text-text-secondary">{m.qty} ขาย</div>
                <div className="text-sm font-semibold tabular-nums text-text-primary">
                  ฿{m.total.toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settlement link */}
        <button
          onClick={() => setShowSettlements(true)}
          className="w-full bg-surface-card rounded-card border border-border p-3.5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-[10px] bg-status-success-bg text-status-success grid place-items-center text-lg shrink-0">
            💰
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold text-text-primary">ประวัติการโอนเงิน</div>
            <div className="text-xs text-text-secondary mt-0.5">
              {isLoading
                ? "กำลังโหลด..."
                : rev?.next_payout
                ? `โอนถัดไป ฿${rev.next_payout.toLocaleString("th-TH")} · ${formatPayoutDate(rev.next_payout_date)}`
                : "ดูประวัติการโอนทั้งหมด"}
            </div>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0" />
        </button>
      </div>
    </div>
  );
}
