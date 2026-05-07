"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShieldCheck, X } from "lucide-react";
import type { ApiResponse, User } from "@/types";

export function PDPAConsent() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: userRes } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe() as Promise<ApiResponse<User>>,
  });

  const consentMutation = useMutation({
    mutationFn: () => api.updateProfile({ pdpa_consent_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const user = userRes?.data;
  const hasConsented = !!user?.pdpa_consent_at;
  const [show, setShow] = useState(true);

  if (pathname === "/" || !user || hasConsented || !show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-modal shadow-2xl border border-brand-primary/20 p-5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
        
        <button 
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-text-tertiary p-1"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5 pr-4">
          <div className="w-10 h-10 rounded-full bg-brand-primary-light text-brand-primary grid place-items-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-primary mb-1">
              นโยบายความเป็นส่วนตัว
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              เราให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ เพื่อประสบการณ์ที่ดียิ่งขึ้น 
              กรุณายอมรับนโยบายเพื่อเริ่มใช้งานนะคะ
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => consentMutation.mutate()}
                disabled={consentMutation.isPending}
                className="flex-1 h-9 rounded-lg bg-brand-primary text-white text-xs font-bold shadow-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {consentMutation.isPending ? "กำลังบันทึก..." : "ยอมรับและเริ่มใช้งาน"}
              </button>
              <a 
                href="/legal/privacy"
                className="px-3 h-9 rounded-lg bg-surface-bg border border-border text-text-secondary text-xs font-medium grid place-items-center"
              >
                อ่านเพิ่ม
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
