"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { api } from "@/lib/api";

export default function NewAddressPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    label: "บ้าน",
    full_address: "",
    note: "",
    is_default: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      router.back();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_address) return;
    createMutation.mutate(form);
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-border bg-surface-card text-base text-text-primary outline-none focus:border-brand-primary transition-colors";

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="เพิ่มที่อยู่ใหม่" onBack={() => router.back()} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider block mb-2 px-1">ชื่อเรียกที่อยู่</label>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="เช่น บ้าน, ที่ทำงาน, หอพัก"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider block mb-2 px-1">ที่อยู่โดยละเอียด</label>
          <textarea
            value={form.full_address}
            onChange={(e) => setForm({ ...form, full_address: e.target.value })}
            placeholder="บ้านเลขที่, หมู่, ซอย, ถนน..."
            className={inputClass}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider block mb-2 px-1">หมายเหตุสำหรับไรเดอร์</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="เช่น ตึกสีเหลือง, ประตูรั้วสีเขียว"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-3 px-1 py-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            className="w-5 h-5 rounded border-border text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm font-medium text-text-primary group-active:text-brand-primary transition-colors">ตั้งเป็นที่อยู่หลัก</span>
        </label>
      </form>

      <div className="p-4 bg-surface-bg border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending || !form.full_address}
          className="w-full h-14 rounded-card bg-brand-primary text-white text-base font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {createMutation.isPending && <Loader2 className="animate-spin" size={20} />}
          บันทึกที่อยู่
        </button>
      </div>
    </div>
  );
}
