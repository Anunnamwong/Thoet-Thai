"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useToastStore } from "@/stores/toast";

type DayCode = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface ShopHoursItem {
  id: string;
  shop_id: string;
  day: DayCode;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface DayState {
  day: DayCode;
  label: string;
  open: string;
  close: string;
  closed: boolean;
}

const DAY_ORDER: { day: DayCode; label: string }[] = [
  { day: "mon", label: "จันทร์" },
  { day: "tue", label: "อังคาร" },
  { day: "wed", label: "พุธ" },
  { day: "thu", label: "พฤหัส" },
  { day: "fri", label: "ศุกร์" },
  { day: "sat", label: "เสาร์" },
  { day: "sun", label: "อาทิตย์" },
];

const DEFAULT_OPEN = "08:00";
const DEFAULT_CLOSE = "17:00";

const toHHMM = (value: string) => (value?.length >= 5 ? value.slice(0, 5) : value || "");

function buildState(items: ShopHoursItem[] | undefined): DayState[] {
  const map = new Map<DayCode, ShopHoursItem>();
  (items ?? []).forEach((h) => map.set(h.day, h));
  return DAY_ORDER.map(({ day, label }) => {
    const found = map.get(day);
    return {
      day,
      label,
      open: found ? toHHMM(found.open_time) : DEFAULT_OPEN,
      close: found ? toHHMM(found.close_time) : DEFAULT_CLOSE,
      closed: found ? found.is_closed : false,
    };
  });
}

function SkeletonRows() {
  return (
    <div className="bg-surface-card rounded-card border border-border overflow-hidden">
      {DAY_ORDER.map(({ day }, idx) => (
        <div
          key={day}
          className={`px-3.5 py-3.5 ${idx > 0 ? "border-t border-border" : ""}`}
        >
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-4 w-14 bg-border rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="h-9 w-20 bg-border rounded-lg" />
              <div className="h-4 w-2 bg-border rounded" />
              <div className="h-9 w-20 bg-border rounded-lg" />
            </div>
            <div className="h-[26px] w-11 bg-border rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShopHoursPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-shop-hours"],
    queryFn: () => api.getMyShopHours() as Promise<ApiResponse<ShopHoursItem[]>>,
  });

  const [hours, setHours] = useState<DayState[]>(() => buildState(undefined));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (data?.data && !hydrated) {
      setHours(buildState(data.data));
      setHydrated(true);
    }
  }, [data, hydrated]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateMyShopHours(
        hours.map((h) => ({
          day: h.day,
          open_time: h.open,
          close_time: h.close,
          is_closed: h.closed,
        }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop-hours"] });
      router.back();
    },
    onError: () => {
      toast("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    },
  });

  const setDay = (idx: number, patch: Partial<DayState>) =>
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));

  const inputClass =
    "w-20 px-2.5 py-2 rounded-lg border border-border bg-surface-card text-base text-text-primary text-center outline-none";

  const isSaving = saveMutation.isPending;
  const saveDisabled = isLoading || isError || isSaving;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="เวลาเปิด-ปิดร้าน" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        <div className="bg-status-warning-bg text-[#7A4F1A] rounded-[10px] px-3 py-3 text-sm leading-relaxed mb-3.5">
          ⚠️ นี่คือเวลาตามตาราง ถ้าจะปิดวันนี้แบบฉุกเฉิน ใช้ปุ่ม &quot;ปิดร้าน&quot; ที่หน้าหลัก
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : isError ? (
          <div className="py-16 text-center">
            <div className="text-sm text-text-secondary mb-3">ไม่สามารถโหลดเวลาเปิด-ปิดได้</div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <div className="bg-surface-card rounded-card border border-border overflow-hidden">
            {hours.map((h, idx) => (
              <div
                key={h.day}
                className={`px-3.5 py-3.5 ${idx > 0 ? "border-t border-border" : ""} ${
                  h.closed ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-text-primary w-[70px]">{h.label}</div>
                  {h.closed ? (
                    <div className="flex-1 text-sm text-text-secondary">ปิด</div>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        value={h.open}
                        onChange={(e) => setDay(idx, { open: e.target.value })}
                        className={inputClass}
                      />
                      <span className="text-text-secondary">–</span>
                      <input
                        value={h.close}
                        onChange={(e) => setDay(idx, { close: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setDay(idx, { closed: !h.closed })}
                    className={`w-11 h-[26px] rounded-full relative shrink-0 transition-colors ${
                      h.closed ? "bg-border" : "bg-status-success"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white shadow transition-all ${
                        h.closed ? "left-0.5" : "left-[20px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 pb-4 bg-surface-bg border-t border-border shrink-0">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveDisabled}
          className="w-full h-[52px] rounded-card bg-brand-primary text-white text-base font-semibold disabled:opacity-60"
        >
          {isSaving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
}
