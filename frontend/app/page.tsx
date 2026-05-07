"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TokenResponse {
  access_token: string;
  user: { role: string };
}

const ROLES = [
  {
    role: "customer",
    href: "/home",
    label: "ลูกค้า",
    sub: "สั่งอาหารจากร้านในชุมชน",
    icon: "🛍️",
    bg: "bg-brand-primary-light",
    border: "border-brand-primary",
    text: "text-brand-primary",
    ctaBg: "bg-brand-primary",
  },
  {
    role: "merchant",
    href: "/merchant/dashboard",
    label: "ร้านค้า",
    sub: "จัดการเมนูและออเดอร์ของร้าน",
    icon: "🏪",
    bg: "bg-brand-secondary-light",
    border: "border-brand-secondary",
    text: "text-brand-secondary",
    ctaBg: "bg-brand-secondary",
  },
  {
    role: "rider",
    href: "/rider/dashboard",
    label: "ไรเดอร์",
    sub: "รับงานส่งอาหาร สร้างรายได้",
    icon: "🛵",
    bg: "bg-status-success-bg",
    border: "border-status-success",
    text: "text-status-success",
    ctaBg: "bg-status-success",
  },
  {
    role: "admin",
    href: "/admin/dashboard",
    label: "แอดมิน",
    sub: "จัดการระบบและผู้ใช้งาน",
    icon: "⚙️",
    bg: "bg-surface-bg",
    border: "border-border",
    text: "text-text-secondary",
    ctaBg: "bg-text-primary",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (role: string, href: string) => {
    setLoading(role);
    setError(null);
    try {
      // Clear any existing session before logging in as a new role
      await api.logout().catch(() => {});
      
      const res = await api.devLogin(role) as ApiResponse<TokenResponse>;
      if (res.success) {
        // Cookies are set by backend automatically
        router.push(href);
      } else {
        setError(res.error ?? "login ไม่สำเร็จ");
      }
    } catch {
      setError("เชื่อมต่อ backend ไม่ได้ — ตรวจสอบว่ารัน server อยู่");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-bg flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary grid place-items-center text-3xl mx-auto mb-3 shadow-sm">
          🍜
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">เทอดไทย เดลิเวอรี่</h1>
        <p className="text-sm text-text-secondary mt-1">ตำบลเทอดไทย อำเภอแม่ฟ้าหลวง เชียงราย</p>
      </div>

      {/* Role selector */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="text-xs text-text-tertiary text-center mb-1 uppercase tracking-wider font-medium">
          เลือกโหมดการใช้งาน
        </p>
        {ROLES.map((role) => (
          <button
            key={role.role}
            onClick={() => handleSelect(role.role, role.href)}
            disabled={loading !== null}
            className={`flex items-center gap-4 p-4 rounded-card border ${role.border} ${role.bg} hover:opacity-90 transition-opacity disabled:opacity-60`}
          >
            <div className="text-2xl w-10 h-10 rounded-[10px] bg-white/60 grid place-items-center shrink-0">
              {loading === role.role ? (
                <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                role.icon
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className={`text-sm font-semibold ${role.text}`}>{role.label}</div>
              <div className="text-xs text-text-secondary mt-0.5">{role.sub}</div>
            </div>
            <svg className={`shrink-0 ${role.text}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 w-full max-w-sm bg-status-danger-bg text-status-danger text-xs rounded-[10px] px-3 py-2.5 text-center">
          {error}
        </div>
      )}

      <p className="text-[11px] text-text-tertiary mt-8">
        เทอดไทย เดลิเวอรี่ · v0.1.0 · Dev Mode
      </p>
    </div>
  );
}
