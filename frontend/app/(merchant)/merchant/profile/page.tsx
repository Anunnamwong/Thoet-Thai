"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

interface ProfileItem {
  icon: string;
  label: string;
  sub?: string;
  href: string | null;
  danger?: boolean;
}
interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

const SECTIONS: ProfileSection[] = [
  {
    title: "ร้านของฉัน",
    items: [
      { icon: "🏪", label: "ข้อมูลร้าน", sub: "ก๋วยเตี๋ยวป้าหล้า", href: null },
      { icon: "🕐", label: "เวลาเปิด-ปิด", sub: "จ.–พฤ. 8:00–17:00", href: "/merchant/hours" },
      { icon: "🏦", label: "บัญชีรับเงิน", sub: "ธ.กรุงเทพ ***1234", href: null },
      { icon: "📍", label: "ที่อยู่ร้าน", sub: "ม.1 ต.เทอดไทย", href: null },
    ],
  },
  {
    title: "ความช่วยเหลือ",
    items: [
      { icon: "❓", label: "คำถามที่พบบ่อย", sub: "", href: null },
      { icon: "💬", label: "ติดต่อแอดมิน", sub: "LINE @thoetthai-merchant", href: null },
      { icon: "📜", label: "ข้อกำหนดและเงื่อนไข", sub: "", href: "/legal/terms" },
    ],
  },
  {
    title: "",
    items: [{ icon: "🚪", label: "ออกจากระบบ", sub: "", href: null, danger: true }],
  },
];

export default function MerchantProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="ฉัน" />
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {/* Shop card */}
        <div className="bg-surface-card rounded-modal border border-border p-4 flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-brand-primary-light text-brand-primary grid place-items-center text-2xl font-bold shrink-0">
            ป
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-text-primary">ก๋วยเตี๋ยวป้าหล้า</div>
            <div className="text-sm text-text-secondary mt-0.5">⭐ 4.8 · 142 รีวิว</div>
          </div>
        </div>

        {SECTIONS.map((sec, sidx) => (
          <div key={sidx} className="mb-4">
            {sec.title && (
              <div className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider mb-1.5 pl-1">
                {sec.title}
              </div>
            )}
            <div className="bg-surface-card rounded-card border border-border overflow-hidden">
              {sec.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => item.href && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3.5 py-4 text-left ${
                    idx > 0 ? "border-t border-border" : ""
                  } ${item.danger ? "text-status-danger" : "text-text-primary"}`}
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium">{item.label}</div>
                    {item.sub && (
                      <div className="text-xs text-text-secondary mt-0.5">{item.sub}</div>
                    )}
                  </div>
                  {!item.danger && (
                    <ChevronRight size={18} className="text-text-secondary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
