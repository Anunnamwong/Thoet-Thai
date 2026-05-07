"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse, Address } from "@/types";

export default function AddressManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: addressRes, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.getAddresses() as Promise<ApiResponse<Address[]>>,
  });

  const addresses = addressRes?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.updateAddress(id, { is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("ต้องการลบที่อยู่นี้ใช่ไหม?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader 
        title="ที่อยู่จัดส่ง" 
        onBack={() => router.back()}
        right={
          <button
            onClick={() => router.push("/profile/addresses/new")}
            className="w-10 h-10 rounded-card bg-brand-primary text-white grid place-items-center mr-2 shrink-0"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
            <div className="text-sm text-text-secondary">กำลังโหลดข้อมูลที่อยู่...</div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">📍</div>
            <div className="text-base font-semibold text-text-primary mb-1">ยังไม่มีที่อยู่จัดส่ง</div>
            <div className="text-sm text-text-secondary">กดปุ่ม + เพื่อเพิ่มที่อยู่ใหม่ได้เลยค่ะ</div>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "bg-surface-card rounded-modal border p-4 transition-all",
                addr.is_default ? "border-brand-primary shadow-sm" : "border-border"
              )}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg grid place-items-center shrink-0",
                    addr.is_default ? "bg-brand-primary text-white" : "bg-surface-bg text-text-secondary border border-border"
                  )}>
                    <MapPin size={16} />
                  </div>
                  <div className="text-base font-bold text-text-primary">{addr.label}</div>
                  {addr.is_default && (
                    <span className="bg-brand-primary-light text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      ค่าเริ่มต้น
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {!addr.is_default && (
                    <button
                      onClick={() => setDefaultMutation.mutate(addr.id)}
                      disabled={setDefaultMutation.isPending}
                      className="w-8 h-8 rounded-lg hover:bg-surface-bg grid place-items-center text-text-tertiary transition-colors"
                      title="ตั้งเป็นค่าเริ่มต้น"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleteMutation.isPending}
                    className="w-8 h-8 rounded-lg hover:bg-status-danger-bg grid place-items-center text-text-tertiary hover:text-status-danger transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-text-secondary leading-relaxed pl-10 pr-2">
                {addr.full_address}
              </div>
              
              {addr.note && (
                <div className="mt-2 pl-10 flex gap-1.5 items-start">
                  <span className="text-[10px] font-bold bg-surface-bg text-text-tertiary px-1 py-0.5 rounded border border-border shrink-0">NOTE</span>
                  <span className="text-xs text-text-tertiary">{addr.note}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-surface-card border-t border-border shrink-0">
        <button
          onClick={() => router.push("/profile/addresses/new")}
          className="w-full h-[54px] rounded-card bg-brand-primary text-white text-base font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} strokeWidth={2.5} />
          เพิ่มที่อยู่ใหม่
        </button>
      </div>
    </div>
  );
}
