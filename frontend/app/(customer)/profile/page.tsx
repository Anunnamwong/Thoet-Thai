"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, LogOut, User as UserIcon, MapPin, Bell, CreditCard, HelpCircle, FileText, Shield } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { api } from "@/lib/api";
import type { ApiResponse, User, Address } from "@/types";

interface ProfileItem {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  danger?: boolean;
}

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

export default function ProfilePage() {
  const router = useRouter();

  const { data: userRes, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe() as Promise<ApiResponse<User>>,
  });

  const { data: addressRes } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.getAddresses() as Promise<ApiResponse<Address[]>>,
  });

  const user = userRes?.data;
  const addresses = addressRes?.data || [];

  const handleLogout = async () => {
    if (confirm("ยืนยันการออกจากระบบใช่ไหม?")) {
      try {
        await api.logout();
        router.push("/");
      } catch (err) {
        console.error("Logout failed:", err);
        // Fallback: just redirect anyway
        router.push("/");
      }
    }
  };

  const sections: ProfileSection[] = [
    {
      title: "บัญชี",
      items: [
        { 
          icon: <UserIcon size={18} className="text-brand-primary" />, 
          label: "ข้อมูลส่วนตัว", 
          sub: user?.display_name || "กำลังโหลด...", 
          onClick: () => {} 
        },
        { 
          icon: <MapPin size={18} className="text-brand-secondary" />, 
          label: "ที่อยู่จัดส่ง", 
          sub: `${addresses.length} ที่อยู่`, 
          onClick: () => router.push("/profile/addresses") 
        },
        { 
          icon: <CreditCard size={18} className="text-status-info" />, 
          label: "วิธีชำระเงิน", 
          sub: "พร้อมเพย์, จ่ายปลายทาง", 
          onClick: () => {} 
        },
        { 
          icon: <Bell size={18} className="text-status-warning" />, 
          label: "การแจ้งเตือน", 
          onClick: () => {} 
        },
      ],
    },
    {
      title: "ความช่วยเหลือ",
      items: [
        { 
          icon: <HelpCircle size={18} />, 
          label: "ช่วยเหลือและติดต่อ", 
          sub: "คำถามที่พบบ่อย, ติดต่อแอดมิน",
          onClick: () => router.push("/profile/support") 
        },
        { icon: <FileText size={18} />, label: "ข้อกำหนดและเงื่อนไข", onClick: () => router.push("/legal/terms") },
        { icon: <Shield size={18} />, label: "นโยบายความเป็นส่วนตัว", onClick: () => router.push("/legal/privacy") },
      ],
    },
    {
      title: "อื่น ๆ",
      items: [
        { 
          icon: <LogOut size={18} />, 
          label: "ออกจากระบบ", 
          onClick: handleLogout,
          danger: true 
        }
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="โปรไฟล์ของฉัน" />
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {/* User card */}
        <div className="bg-surface-card rounded-modal border border-border p-4 flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-brand-primary-light text-brand-primary grid place-items-center text-2xl font-semibold shrink-0">
            {user?.display_name?.charAt(0) || <UserIcon />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-text-primary">
              {userLoading ? "กำลังโหลด..." : user?.display_name}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {user?.phone || "ยังไม่ได้ผูกเบอร์โทรศัพท์"} · เข้าใช้ผ่าน LINE
            </div>
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="mb-4">
            <div className="text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1.5 pl-1">
              {sec.title}
            </div>
            <div className="bg-surface-card rounded-card border border-border overflow-hidden">
              {sec.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3.5 py-3.5 text-left active:bg-surface-bg transition-colors ${
                    idx > 0 ? "border-t border-border" : ""
                  } ${item.danger ? "text-status-danger" : "text-text-primary"}`}
                >
                  <span className="w-6 flex justify-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.sub && (
                      <div className="text-xs text-text-secondary mt-0.5">{item.sub}</div>
                    )}
                  </div>
                  {!item.danger && (
                    <ChevronRight size={16} className="text-text-secondary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-[11px] text-text-tertiary py-2 pb-4">
          เทอดไทย เดลิเวอรี่ · v0.1.0
        </p>
      </div>
    </div>
  );
}
