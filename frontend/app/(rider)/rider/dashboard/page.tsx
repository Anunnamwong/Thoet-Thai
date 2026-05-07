"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bike, ChevronRight, ClipboardList, Loader2, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

const TODAY_STATS = {
  jobs: 0,
  gross: 0,
  hours: 0,
};

export default function RiderDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(false);

  // Fetch rider profile to get current status
  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: () => api.getRiderProfile(),
  });

  useEffect(() => {
    if (profileRes?.data?.status) {
      setOnline(profileRes.data.status === "online");
    }
  }, [profileRes]);

  // Fetch current earnings/stats
  const { data: earningsData } = useQuery({
    queryKey: ["rider-earnings"],
    queryFn: () => api.getRiderEarnings() as Promise<ApiResponse<{ total_today?: number; total_deliveries?: number }>>,
  });
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["rider-active-jobs"],
    queryFn: () => api.getOrders(),
    enabled: online,
    refetchInterval: online ? 10000 : false,
  });

  const stats = earningsData?.data ? {
    jobs: earningsData.data.total_deliveries || 0,
    gross: earningsData.data.total_today || 0,
    hours: 0, // Not available in API yet
  } : TODAY_STATS;

  const statusMutation = useMutation({
    mutationFn: (status: "online" | "offline") => api.updateRiderStatus(status),
    onSuccess: (res) => {
      const status = res.data?.status;
      if (res.success && status) {
        setOnline(status === "online");
        queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
      }
    }
  });
  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => api.acceptJob(orderId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
      const orderId = res.data?.order_id;
      if (orderId) {
        router.push(`/rider/job/${orderId}`);
      }
    },
  });

  const fg    = online ? "text-white" : "text-text-primary";
  const fgSub = online ? "text-white/70" : "text-text-secondary";
  const toggleStatus = () => statusMutation.mutate(online ? "offline" : "online");
  const riderOrders = ordersData?.data ?? [];
  const currentJobs = riderOrders.filter((o) => ["rider_assigned", "picked_up"].includes(o.status));
  const availableJobs = riderOrders.filter((o) => o.status === "ready_for_pickup");
  const primaryCurrentJob = currentJobs[0];

  if (profileLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-surface-bg">
        <div className="w-8 h-8 rounded-full border-2 border-brand-secondary border-t-transparent animate-spin mb-2" />
        <div className="text-sm text-text-secondary">กำลังโหลดข้อมูลไรเดอร์...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden transition-colors duration-300",
        online ? "bg-brand-secondary" : "bg-surface-bg"
      )}
    >
      {/* Top bar */}
      <div className="px-5 pt-12 pb-4 flex justify-between items-center shrink-0">
        <div>
          <div className={cn("text-sm", fgSub)}>สวัสดีค่ะ</div>
          <div className={cn("text-xl font-bold", fg)}>พี่ไรเดอร์</div>
        </div>
        <div
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-semibold border",
            online
              ? "bg-white/20 text-white border-transparent"
              : "bg-surface-card text-text-primary border-border"
          )}
        >
          🛵 มอเตอร์ไซค์
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-4">
        {/* Big status circle */}
        <div
          className={cn(
            "w-[188px] h-[188px] rounded-full grid place-items-center mx-auto mb-4 transition-all duration-300",
            online
              ? "bg-white/15 border-[6px] border-white/40 shadow-[0_0_0_12px_rgba(255,255,255,0.08)]"
              : "bg-surface-card border-[6px] border-border"
          )}
        >
          <div className="text-center">
            <div className="text-5xl mb-1">{online ? "🟢" : "⚫"}</div>
            <div className={cn("text-xl font-bold", online ? "text-white" : "text-text-primary")}>
              {online ? "ออนไลน์" : "ออฟไลน์"}
            </div>
            <div className={cn("text-sm mt-0.5", fgSub)}>
              {online ? "พร้อมรับงาน" : "ไม่รับงาน"}
            </div>
          </div>
        </div>

        <p
          className={cn(
            "text-sm text-center max-w-[280px] leading-relaxed mb-5 mx-auto",
            fgSub
          )}
        >
          {online
            ? "ระบบกำลังส่งตำแหน่งของคุณ เมื่อมีงานใกล้เคียงจะแจ้งเตือนทันที"
            : "กดปุ่มด้านล่างเพื่อเริ่มรับงาน — ระบบจะหาออเดอร์ใกล้คุณ"}
        </p>

        <button
          onClick={toggleStatus}
          disabled={statusMutation.isPending}
          className={cn(
            "w-full h-[60px] rounded-[16px] text-lg font-bold transition-all disabled:opacity-70",
            online
              ? "bg-white text-brand-secondary shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
              : "bg-brand-secondary text-white shadow-[0_6px_16px_rgba(45,106,79,0.4)]"
          )}
        >
          {statusMutation.isPending ? "กำลังอัปเดต..." : online ? "ออฟไลน์" : "เริ่มรับงาน · ออนไลน์"}
        </button>

        {online && (
          <div className="mt-4 flex flex-col gap-3">
            {primaryCurrentJob && (
              <button
                onClick={() => router.push(`/rider/job/${primaryCurrentJob.id}`)}
                className="w-full rounded-card bg-white/15 border border-white/25 px-4 py-3 text-left text-white flex items-center gap-3 active:scale-[0.99] transition-transform"
              >
                <div className="w-10 h-10 rounded-card bg-white/20 grid place-items-center shrink-0">
                  <Bike size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">งานที่กำลังส่ง</div>
                  <div className="text-xs text-white/75 truncate">
                    #{primaryCurrentJob.order_number} · {primaryCurrentJob.shop_name ?? "ร้านอาหาร"}
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0" />
              </button>
            )}

            <div className={cn("rounded-card border p-3", online ? "bg-white text-text-primary border-transparent" : "bg-surface-card border-border")}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-brand-secondary" />
                  <div className="text-sm font-bold">งานรอรับ</div>
                </div>
                <div className="text-xs text-text-secondary">{availableJobs.length} งาน</div>
              </div>

              {ordersLoading ? (
                <div className="h-20 grid place-items-center text-text-secondary">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : availableJobs.length === 0 ? (
                <div className="rounded-[10px] bg-surface-bg px-3 py-4 text-center text-sm text-text-secondary">
                  ยังไม่มีงานใหม่
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableJobs.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="rounded-[10px] bg-surface-bg border border-border px-3 py-2.5 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-brand-primary-light text-brand-primary grid place-items-center shrink-0">
                        <Store size={18} />
                      </div>
                      <button
                        onClick={() => router.push(`/rider/job/${order.id}`)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="text-sm font-semibold text-text-primary truncate">
                          {order.shop_name ?? "ร้านอาหาร"}
                        </div>
                        <div className="text-xs text-text-secondary">
                          #{order.order_number} · ฿{order.total.toLocaleString("th-TH")}
                        </div>
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate(order.id)}
                        disabled={acceptMutation.isPending}
                        className="h-9 px-3 rounded-btn bg-brand-primary text-white text-xs font-bold disabled:opacity-60"
                      >
                        รับงาน
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Today summary */}
      <div
        className={cn(
          "px-5 py-3.5 flex justify-around border-t shrink-0",
          online ? "bg-black/18 border-transparent" : "bg-surface-card border-border"
        )}
      >
        {[
          { label: "งานวันนี้", value: stats.jobs, unit: "งาน" },
          { label: "รายได้", value: `฿${stats.gross}`, unit: "" },
          { label: "ออนไลน์", value: stats.hours, unit: "ชม." },
        ].map(({ label, value, unit }, i) => (
          <div key={i} className="text-center flex-1">
            <div className={cn("text-xs mb-0.5", fgSub)}>{label}</div>
            <div className={cn("text-lg font-bold tabular-nums", online ? "text-white" : "text-text-primary")}>
              {value}
              {unit && <span className={cn("text-xs font-medium ml-0.5", fgSub)}>{unit}</span>}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
