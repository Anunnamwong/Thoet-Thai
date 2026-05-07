"use client";

import { ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

interface ProfileItem {
  icon: string;
  label: string;
  sub?: string;
  danger?: boolean;
}
interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

const SECTIONS: ProfileSection[] = [
  {
    title: "บัญชีของฉัน",
    items: [
      { icon: "🛵", label: "ข้อมูลรถ", sub: "มอเตอร์ไซค์ · กข 1234 เชียงราย" },
      { icon: "🪪", label: "ใบขับขี่ + บัตร ปชช.", sub: "ยืนยันแล้ว ✓" },
      { icon: "🏦", label: "บัญชีรับเงิน", sub: "ธ.ออมสิน ***5566" },
    ],
  },
  {
    title: "ความช่วยเหลือ",
    items: [
      { icon: "❓", label: "คำถามที่พบบ่อย" },
      { icon: "💬", label: "ติดต่อแอดมิน", sub: "LINE @thoetthai-rider" },
      { icon: "🆘", label: "เกิดอุบัติเหตุ?", sub: "โทรฉุกเฉิน 24 ชม.", danger: true },
    ],
  },
  {
    title: "",
    items: [{ icon: "🚪", label: "ออกจากระบบ", danger: true }],
  },
];

export default function RiderProfilePage() {
  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="ฉัน" />
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {/* Profile card */}
        <div className="bg-surface-card rounded-modal border border-border p-4 flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-status-success-bg text-status-success grid place-items-center text-2xl font-bold shrink-0">
            ส
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-text-primary">พี่สมชาย</div>
            <div className="text-sm text-text-secondary mt-0.5">⭐ 4.9 · 1,248 งาน</div>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-4 text-left ${
                    idx > 0 ? "border-t border-border" : ""
                  } ${item.danger ? "text-status-danger" : "text-text-primary"}`}
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
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
