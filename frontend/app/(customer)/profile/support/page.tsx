"use client";

import Link from "next/link";
import { ChevronLeft, MessageCircle, Phone, HelpCircle, ChevronRight } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    { q: "แอปเปิดกี่โมง?", a: "ขึ้นอยู่กับร้านค้าแต่ละร้านค่ะ แต่ส่วนใหญ่จะเริ่มตั้งแต่ 07:00 - 20:00 น." },
    { q: "ชำระเงินทางไหนได้บ้าง?", a: "รองรับทั้งเงินสดปลายทาง (COD) และพร้อมเพย์ (PromptPay) ค่ะ" },
    { q: "ค่าส่งคิดยังไง?", a: "ค่าส่งเริ่มต้นที่ 15 บาท ตามระยะทางในเขตตำบลเทอดไทยค่ะ" },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-12 pb-2.5 border-b border-border bg-surface-bg shrink-0">
        <Link
          href="/profile"
          className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-text-primary"
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </Link>
        <div className="text-base font-semibold text-text-primary">ช่วยเหลือและติดต่อ</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Help Cards */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="https://line.me" 
            target="_blank"
            className="flex flex-col items-center justify-center p-5 bg-surface-card rounded-modal border border-border text-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-[#06C755]/10 text-[#06C755] grid place-items-center">
              <MessageCircle size={24} />
            </div>
            <div className="text-sm font-bold text-text-primary">แชทผ่าน LINE</div>
          </a>
          <a 
            href="tel:0812345678"
            className="flex flex-col items-center justify-center p-5 bg-surface-card rounded-modal border border-border text-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center">
              <Phone size={24} />
            </div>
            <div className="text-sm font-bold text-text-primary">โทรหาแอดมิน</div>
          </a>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <HelpCircle size={18} className="text-brand-primary" />
            คำถามที่พบบ่อย (FAQ)
          </h2>
          <div className="bg-surface-card rounded-modal border border-border divide-y divide-border">
            {faqs.map((f, i) => (
              <div key={i} className="p-4">
                <div className="text-sm font-bold text-text-primary mb-1.5">{f.q}</div>
                <div className="text-sm text-text-secondary leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Buttons */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-surface-card rounded-modal border border-border text-left group active:bg-surface-bg transition-colors">
            <span className="text-sm font-semibold text-text-primary">รายงานปัญหาการใช้งาน</span>
            <ChevronRight size={18} className="text-text-tertiary group-active:translate-x-0.5 transition-transform" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-surface-card rounded-modal border border-border text-left group active:bg-surface-bg transition-colors">
            <span className="text-sm font-semibold text-text-primary">แนะนำ/ติชม</span>
            <ChevronRight size={18} className="text-text-tertiary group-active:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <p className="text-center text-[11px] text-text-tertiary py-4 uppercase tracking-widest">
          Thoet Thai Delivery Support<br />
          Version 0.1.0
        </p>
      </div>
    </div>
  );
}
