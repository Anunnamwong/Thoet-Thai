"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Phone, MapPin, Store, Check, Loader2, Bike } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToastStore } from "@/stores/toast";
import type { ApiResponse, Order } from "@/types";

const STEPS = [
  {
    id: "to-shop",
    label: "ไปถึงร้านแล้ว",
    headline: "ไปร้านอาหาร",
    sub: "นำทางไปยังร้านและแจ้งออเดอร์ให้ร้านทราบ",
    target: "shop" as const,
    verb: "ไปร้าน",
    nextStatus: null, // Still in rider_assigned
  },
  {
    id: "pickup",
    label: "รับของแล้ว",
    headline: "รับของจากร้าน",
    sub: "ตรวจสอบรายการให้ครบก่อนกดยืนยัน",
    target: "shop" as const,
    verb: "ที่ร้าน",
    nextStatus: "picked_up",
  },
  {
    id: "to-drop",
    label: "ถึงที่ส่งแล้ว",
    headline: "ไปบ้านลูกค้า",
    sub: "นำอาหารไปส่งตามที่อยู่ที่ลูกค้าระบุ",
    target: "drop" as const,
    verb: "ไปส่ง",
    nextStatus: null, // Still in picked_up
  },
  {
    id: "delivered",
    label: "ส่งสำเร็จ",
    headline: "ส่งของให้ลูกค้า",
    sub: "ตรวจสอบยอดเงินและถ่ายรูปยืนยัน",
    target: "drop" as const,
    verb: "ที่จุดส่ง",
    nextStatus: "delivered",
  },
];

const STATUS_TO_STEP: Record<string, number> = {
  rider_assigned: 0,
  picked_up: 2,
  delivered: 4,
};

export default function RiderJobPage() {
  const { toast } = useToastStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const { data: orderRes, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.getOrder(id) as Promise<ApiResponse<Order>>,
    enabled: !!id,
  });

  const order = orderRes?.data;

  // Initialize step based on order status
  useEffect(() => {
    if (order) {
      if (order.status === "delivered") {
        setDone(true);
      } else {
        const initialStep = STATUS_TO_STEP[order.status] ?? 0;
        setStepIdx(initialStep);
      }
    }
  }, [order]);

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.updateRiderJobStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["rider-history"] });
      queryClient.invalidateQueries({ queryKey: ["rider-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
    },
    onError: (err: any) => {
      toast(err.message || "ไม่สามารถอัปเดตสถานะได้");
    }
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.acceptJob(id),
    onSuccess: (res: any) => {
      toast("รับงานสำเร็จ!");
      // Invalidate everything to be safe
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
      // Minor delay to ensure DB consistency before re-fetch if needed
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["order", id] });
      }, 500);
    },
    onError: (err: any) => {
      toast(err.message || "ไม่สามารถรับงานได้ ออเดอร์อาจถูกรับไปแล้ว");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.rejectJob(id),
    onSuccess: () => {
      toast("ยกเลิกงานแล้ว ระบบจะส่งงานให้ไรเดอร์คนอื่น");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
      router.push("/rider/dashboard");
    },
    onError: (err: any) => {
      toast(err.message || "ไม่สามารถยกเลิกงานนี้ได้");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-text-primary items-center justify-center text-white">
        <Loader2 className="animate-spin mb-2" size={32} />
        <div className="text-sm opacity-70">กำลังโหลดข้อมูลงาน...</div>
      </div>
    );
  }

  if (error || (!order && id !== "TT-DEMO")) {
    return (
      <div className="flex flex-col h-full bg-text-primary items-center justify-center text-white px-6 text-center">
        <div className="text-4xl mb-4">❌</div>
        <div className="text-lg font-bold">ไม่พบข้อมูลงาน</div>
        <div className="text-sm opacity-70 mt-1">ออเดอร์อาจถูกยกเลิก หรือคุณไม่มีสิทธิ์เข้าถึง</div>
        <button
          onClick={() => router.push("/rider/dashboard")}
          className="mt-6 px-6 py-2.5 bg-white/10 rounded-lg text-sm font-semibold border border-white/20"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  // Demo fallback
  const job = order ? {
    id: order.order_number,
    shopName: order.shop?.name || "ร้านอาหาร",
    shopAddr: order.shop?.full_address || "ที่อยู่ร้านค้า",
    shopPhone: order.shop?.phone || "",
    customerName: "ลูกค้า",
    dropAddr: order.delivery_address,
    customerPhone: "",
    fee: order.delivery_fee,
    cod: order.payment_method === "cod" ? order.total : 0,
  } : {
    id: "TT-DEMO",
    shopName: "ก๋วยเตี๋ยวป้าหล้า",
    shopAddr: "บ้านเทอดไทย หมู่ 1",
    shopPhone: "053-123456",
    customerName: "นภัสกร เจริญสุข",
    dropAddr: "123/4 หมู่ 1 ต.เทอดไทย",
    customerPhone: "088-234-5678",
    fee: 40,
    cod: 165,
  };

  const step = STEPS[stepIdx] || STEPS[0];
  const isAtShop = step.target === "shop";
  const isLastStep = stepIdx === STEPS.length - 1;
  const showCOD = stepIdx === 3 && job.cod > 0;
  const showPhoto = stepIdx === 3;

  const targetName = isAtShop ? job.shopName : job.customerName;
  const targetAddr = isAtShop ? job.shopAddr : job.dropAddr;
  const targetPhone = isAtShop ? job.shopPhone : job.customerPhone;
  const canCancelJob = order?.status === "rider_assigned";

  const handleNext = async () => {
    const nextStatus = step.nextStatus;
    if (nextStatus) {
      await statusMutation.mutateAsync(nextStatus);
    }

    if (isLastStep) {
      setDone(true);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 gap-3">
          <div className="w-[100px] h-[100px] rounded-full bg-status-success-bg grid place-items-center">
            <Check size={56} className="text-status-success" strokeWidth={3} />
          </div>
          <div className="text-[26px] font-extrabold text-text-primary mt-2">ส่งสำเร็จ!</div>
          <div className="text-sm text-text-secondary">งาน #{job.id}</div>
          <div className="bg-surface-card rounded-modal border border-border p-5 w-full max-w-[320px] mt-4">
            <div className="text-center mb-3.5">
              <div className="text-xs text-text-secondary mb-0.5">คุณได้รับ</div>
              <div className="text-[44px] font-extrabold text-brand-primary tabular-nums leading-tight">
                ฿{job.fee}
              </div>
            </div>
            <div className="border-t border-border pt-3 flex flex-col gap-1.5 text-sm">
              {[
                { label: "ระยะทาง", value: "2.4 กม." },
                { label: "เวลา", value: "12 นาที" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-text-secondary">{label}</span>
                  <span className="text-text-secondary tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 pb-5 shrink-0">
          <button
            onClick={() => router.push("/rider/dashboard")}
            className="w-full h-[60px] rounded-modal bg-brand-secondary text-white text-base font-bold"
          >
            เสร็จ · กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const isClaimable = order && !order.rider_id;

  if (isClaimable) {
    return (
      <div className="flex flex-col h-full bg-text-primary overflow-hidden text-white">
        <ScreenHeader title="รับงานใหม่" onBack={() => router.push("/rider/dashboard")} dark />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-brand-primary/20 grid place-items-center mb-6">
            <Bike size={40} className="text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">มีงานใหม่ใกล้คุณ!</h2>
          <p className="text-white/70 mb-8">ระยะทางประมาณ 1.2 กม. สั่งจากร้าน {job.shopName}</p>
          
          <div className="bg-white/10 rounded-2xl p-5 w-full mb-8 border border-white/10">
            <div className="flex justify-between mb-3">
              <span className="text-white/60">ค่าส่งที่คุณได้รับ</span>
              <span className="text-xl font-bold text-brand-primary">฿{job.fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ร้านค้า</span>
              <span className="font-semibold">{job.shopName}</span>
            </div>
          </div>

          <button
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            className="w-full h-[72px] rounded-2xl bg-brand-primary text-white text-xl font-extrabold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {acceptMutation.isPending ? <Loader2 className="animate-spin" /> : "กดรับงานนี้"}
          </button>
          
          <button 
            onClick={() => router.push("/rider/dashboard")}
            className="mt-4 text-white/50 font-medium"
          >
            ไม่รับงานนี้
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-text-primary overflow-hidden text-white">
      <ScreenHeader
        title={`#${job.id}`}
        sub={`ขั้นที่ ${stepIdx + 1} จาก 4`}
        onBack={() => router.push("/rider/dashboard")}
        dark
        right={
          canCancelJob ? (
            <button
              onClick={() => {
                if (window.confirm("ยกเลิกงานนี้และส่งต่อให้ไรเดอร์คนอื่นใช่ไหม?")) {
                  rejectMutation.mutate();
                }
              }}
              disabled={rejectMutation.isPending}
              className="h-9 px-3 rounded-lg bg-white/15 text-white border border-white/30 text-xs font-medium mr-2 shrink-0 disabled:opacity-60"
            >
              {rejectMutation.isPending ? "กำลังยกเลิก..." : "ยกเลิก"}
            </button>
          ) : null
        }
      />

      <div className="flex-1 px-4 py-3.5 flex flex-col gap-3 overflow-hidden">
        {/* Progress pills */}
        <div className="flex gap-1 justify-between shrink-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full",
                i <= stepIdx ? "bg-brand-secondary" : "bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Step headline */}
        <div className="shrink-0">
          <div className="text-xs text-white/70 uppercase tracking-wider font-semibold">
            ขั้นที่ {stepIdx + 1}
          </div>
          <div className="text-[28px] font-extrabold mt-0.5">{step.headline}</div>
          <div className="text-sm text-white/80 mt-1">{step.sub}</div>
        </div>

        {/* Target card */}
        <div className="bg-white/8 border border-white/18 rounded-modal p-3.5 flex items-center gap-3 shrink-0">
          <div
            className={cn(
              "w-[52px] h-[52px] rounded-card grid place-items-center shrink-0",
              isAtShop ? "bg-brand-primary" : "bg-brand-secondary"
            )}
          >
            {isAtShop ? (
              <Store size={26} className="text-white" />
            ) : (
              <MapPin size={26} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              {isAtShop ? "ร้าน" : "ลูกค้า"}
            </div>
            <div className="text-lg font-bold mt-0.5 truncate">{targetName}</div>
            <div className="text-sm text-white/70">{targetAddr}</div>
          </div>
          {targetPhone && (
            <a
              href={`tel:${targetPhone}`}
              className="w-12 h-12 rounded-card bg-brand-secondary grid place-items-center shrink-0"
            >
              <Phone size={22} className="text-white" />
            </a>
          )}
        </div>

        {/* COD reminder */}
        {showCOD && (
          <div className="bg-status-warning-bg text-[#7A4F1A] rounded-card p-3.5 flex items-center gap-3 shrink-0">
            <span className="text-3xl">💵</span>
            <div>
              <div className="text-sm font-semibold">ต้องเก็บเงินสดจากลูกค้า</div>
              <div className="text-[24px] font-extrabold tabular-nums">฿{job.cod}</div>
            </div>
          </div>
        )}

        {/* Photo slot */}
        {showPhoto && (
          <button className="w-full px-3.5 py-3.5 rounded-card bg-white/8 border border-dashed border-white/30 text-white flex items-center gap-3 shrink-0">
            <Camera size={26} />
            <div className="text-left">
              <div className="text-sm font-semibold">ถ่ายรูปยืนยันการส่ง</div>
              <div className="text-xs text-white/70 mt-0.5">
                แนะนำ — ลูกค้ารับของแล้ววางหน้าบ้าน
              </div>
            </div>
          </button>
        )}

        <div className="flex-1" />

        {/* Maps button */}
        <button 
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(targetAddr)}`;
            window.open(url, "_blank");
          }}
          className="w-full h-[60px] rounded-modal bg-blue-500 text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(59,130,246,0.4)] shrink-0 active:scale-95 transition-transform"
        >
          <MapPin size={22} />
          นำทางไป{step.verb} (Google Maps)
        </button>

        {/* Advance step */}
        <button
          onClick={handleNext}
          disabled={statusMutation.isPending}
          className="w-full h-[72px] rounded-modal bg-brand-secondary text-white text-xl font-extrabold shrink-0 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {statusMutation.isPending && <Loader2 className="animate-spin" size={24} />}
          ✓ {step.label}
        </button>
      </div>
    </div>
  );
}
