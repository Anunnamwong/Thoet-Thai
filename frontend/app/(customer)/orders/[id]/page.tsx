"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Clock, Check, Phone, MessageCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToastStore } from "@/stores/toast";
import type { ApiResponse } from "@/types";

interface OrderOut {
  id: string;
  order_number: string;
  shop_id: string;
  status: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  items: { id: string; item_name: string; quantity: number; line_total: number }[];
  estimated_ready_at?: string;
  rider_latitude?: number;
  rider_longitude?: number;
  rider_name?: string;
  rider_phone?: string;
  created_at: string;
}

const TRACK_STEPS = [
  { id: "placed",    label: "รับคำสั่งซื้อแล้ว",    sub: "ส่งให้ร้านแล้ว" },
  { id: "cooking",   label: "ร้านกำลังทำอาหาร",     sub: "อยู่ระหว่างเตรียม" },
  { id: "pickup",    label: "ไรเดอร์รับอาหารแล้ว",  sub: "กำลังมาส่ง" },
  { id: "arriving",  label: "กำลังมาถึง",            sub: "อีกประมาณ 5 นาที" },
  { id: "delivered", label: "ส่งสำเร็จ",             sub: "" },
];

const STATUS_TO_STEP: Record<string, number> = {
  paid: 0,
  preparing: 1,
  ready_for_pickup: 2,
  rider_assigned: 2,
  picked_up: 3,
  delivered: 4,
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "จ่ายปลายทาง",
  promptpay: "PromptPay",
};

export default function OrderTrackingPage() {
  const { toast } = useToastStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [now, setNow] = useState(() => Date.now());

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.getOrder(id) as Promise<ApiResponse<OrderOut>>,
  });

  const order = data?.data;
  const stepIdx = order ? (STATUS_TO_STEP[order.status] ?? 0) : 0;
  const current = TRACK_STEPS[stepIdx];
  const isDone = order?.status === "delivered" || order?.status === "cancelled";
  const isCancelled = order?.status === "cancelled";
  const cancelDeadline = order ? new Date(order.created_at).getTime() + 2 * 60 * 1000 : 0;
  const cancelSecondsLeft = Math.max(0, Math.ceil((cancelDeadline - now) / 1000));
  const canCancel =
    !!order &&
    !isDone &&
    (order.status === "pending_payment" ||
      (order.status === "paid" && cancelSecondsLeft > 0));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const cancelMutation = useMutation({
    mutationFn: () => api.cancelOrder(id, "ลูกค้ายกเลิกคำสั่งซื้อ"),
    onSuccess: () => {
      toast("ยกเลิกคำสั่งซื้อแล้ว");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (err: any) => {
      toast(err.message || "ยกเลิกไม่สำเร็จ กรุณาติดต่อร้านค้าหรือแอดมิน");
    },
  });

  // Real or simulated rider position
  const hasRealLocation = order?.rider_latitude && order?.rider_longitude;
  
  // For the SVG visual, we still use relative percentages
  const riderLeft = hasRealLocation ? "50%" : `${25 + stepIdx * 12}%`;
  const riderTop = hasRealLocation ? "45%" : `${30 + stepIdx * 12}%`;

  const formatETA = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };
  const getReadyCountdownText = (iso: string) => {
    const diffMs = new Date(iso).getTime() - now;
    if (diffMs <= 0) return "ใกล้เสร็จแล้ว";
    const mins = Math.ceil(diffMs / 60000);
    return `อีก ${mins} นาที`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-surface-bg">
        <ScreenHeader title="ติดตามคำสั่งซื้อ" onBack={() => router.back()} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col h-full bg-surface-bg">
        <ScreenHeader title="ติดตามคำสั่งซื้อ" onBack={() => router.back()} />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="text-4xl">😕</div>
          <div className="text-sm text-text-secondary">ไม่พบออเดอร์นี้</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="ติดตามคำสั่งซื้อ" sub={`#${order.order_number}`} onBack={() => router.back()} />

      {/* Map Simulation */}
      <div className="h-[210px] relative bg-[#E8EDE3] shrink-0 border-b border-border">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 5 H10 M5 0 V10" stroke="#D4DBC9" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <path d="M0 60 Q40 55 100 65" stroke="#fff" strokeWidth="2.5" fill="none" />
          <path d="M50 0 Q48 40 55 60 T50 100" stroke="#fff" strokeWidth="2" fill="none" />
          
          {/* Shop */}
          <circle cx="25" cy="30" r="3.5" fill="#1A1A17" opacity="0.1" />
          <circle cx="25" cy="30" r="2" fill="#1A1A17" />
          
          {/* Customer */}
          <circle cx="75" cy="80" r="4.5" fill="#E85D2E" opacity="0.15" />
          <circle cx="75" cy="80" r="2.5" fill="#E85D2E" />
          
          {/* Route path */}
          <path d="M25 30 Q40 50 60 65 T75 80" stroke="#E85D2E" strokeWidth="1.2" strokeDasharray="2 2" fill="none" opacity="0.5" />
        </svg>

        {/* Real-time Rider Icon */}
        {!isCancelled && (
          <div
            className="absolute transition-all duration-1000 ease-in-out"
            style={{ left: riderLeft, top: riderTop, transform: "translate(-50%,-50%)" }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white px-2 py-0.5 rounded-full shadow-sm border border-border text-[9px] font-bold text-text-primary whitespace-nowrap">
                {hasRealLocation ? "กำลังส่ง" : current.label}
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-primary grid place-items-center text-lg shadow-xl border-[3px] border-white animate-in zoom-in duration-500">
                🛵
              </div>
            </div>
          </div>
        )}
        
        {hasRealLocation && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-brand-secondary border border-brand-secondary/20 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
            LIVE TRACKING
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 flex flex-col gap-3">
        {/* Status card */}
        <div className="bg-surface-card rounded-modal border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isCancelled
                  ? "bg-status-danger"
                  : isDone
                  ? "bg-status-success"
                  : "bg-brand-primary animate-[pulse_1.4s_ease-in-out_infinite]"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isCancelled ? "text-status-danger" : isDone ? "text-status-success" : "text-brand-primary"
              )}
            >
              {isCancelled ? "ยกเลิกแล้ว" : isDone ? "เสร็จสิ้น" : "กำลังดำเนินการ"}
            </span>
          </div>
          <div className="text-lg font-semibold text-text-primary mb-0.5">{current.label}</div>
          {current.sub && <div className="text-sm text-text-secondary">{current.sub}</div>}
          
          {order.estimated_ready_at && order.status === "preparing" && (
            <div className="mt-3 px-3 py-2.5 bg-brand-primary-light rounded-[10px] flex items-center gap-3 border border-brand-primary/10">
              <Clock size={16} strokeWidth={2.5} className="text-brand-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-brand-primary tabular-nums">
                  {getReadyCountdownText(order.estimated_ready_at)}
                </div>
                <div className="text-xs text-brand-primary/75">
                  คาดว่าจะเสร็จประมาณ {formatETA(order.estimated_ready_at)}
                </div>
              </div>
            </div>
          )}

          {!isDone && !isCancelled && !order.estimated_ready_at && (
            <div className="mt-3 px-3 py-2.5 bg-surface-bg rounded-[10px] text-sm flex items-center gap-2 text-text-secondary">
              <Clock size={14} strokeWidth={2} />
              คาดว่าจะถึงในอีก <b className="text-text-primary">15–20 นาที</b>
            </div>
          )}
        </div>

        {/* Rider contact card */}
        {order.status !== "delivered" && order.status !== "cancelled" && (order.status === "rider_assigned" || order.status === "picked_up") && (
          <div className="bg-surface-card rounded-modal border border-border p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-brand-secondary/10 text-brand-secondary grid place-items-center shrink-0 text-2xl">
              🛵
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">ไรเดอร์ผู้จัดส่ง</div>
              <div className="text-base font-bold text-text-primary truncate">
                {order.rider_name || "สมชาย วิ่งเร็ว"}
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href={`tel:${order.rider_phone || "0844444444"}`}
                className="w-10 h-10 rounded-full bg-surface-bg border border-border grid place-items-center text-text-primary active:bg-border transition-colors shadow-sm"
              >
                <Phone size={18} strokeWidth={2.2} />
              </a>
              <a 
                href="https://line.me"
                target="_blank"
                className="w-10 h-10 rounded-full bg-[#06C755] grid place-items-center text-white active:opacity-80 transition-opacity shadow-sm"
              >
                <MessageCircle size={18} strokeWidth={2.2} />
              </a>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="bg-surface-card rounded-modal border border-border p-4">
          {TRACK_STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            const isLast = i === TRACK_STEPS.length - 1;
            return (
              <div key={s.id} className={cn("flex gap-3", !isLast && "pb-3.5")}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-[22px] h-[22px] rounded-full grid place-items-center",
                      done
                        ? "bg-brand-secondary text-white"
                        : active
                        ? "bg-brand-primary text-white ring-4 ring-brand-primary-light"
                        : "bg-border text-transparent"
                    )}
                  >
                    {done && <Check size={12} strokeWidth={3} />}
                  </div>
                  {!isLast && (
                    <div className={cn("flex-1 w-0.5 mt-0.5", done ? "bg-brand-secondary" : "bg-border")} />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <div
                    className={cn(
                      "text-sm",
                      done || active ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
                    )}
                  >
                    {s.label}
                  </div>
                  {s.sub && (done || active) && (
                    <div className="text-xs text-text-secondary mt-0.5">{s.sub}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-surface-card rounded-modal border border-border p-3.5">
          {[
            { label: "เลขคำสั่งซื้อ", value: `#${order.order_number}`, mono: true },
            { label: "การชำระเงิน",   value: PAYMENT_LABEL[order.payment_method] ?? order.payment_method },
            { label: "ที่อยู่ส่ง",    value: order.delivery_address },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between items-start py-1.5 gap-4">
              <span className="text-sm text-text-secondary shrink-0">{label}</span>
              <span className={cn("text-sm font-medium text-text-primary text-right", mono && "font-mono")}>
                {value}
              </span>
            </div>
          ))}
          <div className="border-t border-border mt-1.5 pt-2.5 flex justify-between">
            <span className="text-sm text-text-secondary">ยอดรวม</span>
            <span className="text-base font-bold text-text-primary tabular-nums">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {isDone && !isCancelled ? (
          <button
            onClick={() => router.push("/home")}
            className="w-full h-12 rounded-card bg-brand-primary text-white text-sm font-semibold"
          >
            สั่งอาหารอีกครั้ง
          </button>
        ) : canCancel ? (
          <button
            onClick={() => {
              if (window.confirm("ยกเลิกคำสั่งซื้อนี้ใช่ไหม?")) {
                cancelMutation.mutate();
              }
            }}
            disabled={cancelMutation.isPending}
            className="w-full h-11 rounded-card border border-border text-status-danger text-sm font-medium disabled:opacity-60"
          >
            {cancelMutation.isPending
              ? "กำลังยกเลิก..."
              : order.status === "paid"
              ? `ยกเลิกคำสั่งซื้อ (${cancelSecondsLeft} วิ)`
              : "ยกเลิกคำสั่งซื้อ"}
          </button>
        ) : !isCancelled ? (
          <p className="text-center text-xs text-text-secondary py-2">
            {order.status === "paid" ? "เลยเวลายกเลิกแล้ว" : "ร้านเริ่มทำแล้ว ยกเลิกไม่ได้นะคะ"} —{" "}
            <span className="text-brand-primary font-medium">ติดต่อแอดมิน</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
