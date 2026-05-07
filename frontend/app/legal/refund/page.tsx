import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "นโยบายการคืนเงิน — เทอดไทย เดลิเวอรี่" };

interface RefundCase {
  icon: string;
  title: string;
  desc: string;
  eligible: boolean;
  timeline?: string;
}

const CASES: RefundCase[] = [
  {
    icon: "🚫",
    title: "ร้านค้าไม่รับออเดอร์หรือปิดร้าน",
    desc: "ร้านค้าไม่ยืนยันออเดอร์ภายในเวลาที่กำหนด หรือออเดอร์ถูกยกเลิกโดยร้านค้า",
    eligible: true,
    timeline: "คืนเงินภายใน 1–3 วันทำการ",
  },
  {
    icon: "⏱️",
    title: "ยกเลิกภายใน 1 นาทีหลังสั่ง",
    desc: "ลูกค้ากดยกเลิกออเดอร์ภายใน 1 นาที ก่อนที่ร้านเริ่มเตรียมอาหาร",
    eligible: true,
    timeline: "คืนเงินภายใน 1–3 วันทำการ",
  },
  {
    icon: "📦",
    title: "อาหารไม่ตรงกับออเดอร์",
    desc: "ได้รับอาหารไม่ครบ หรือผิดรายการอย่างมีนัยสำคัญ โปรดติดต่อภายใน 30 นาทีหลังได้รับ",
    eligible: true,
    timeline: "พิจารณาเป็นรายกรณี ภายใน 3–7 วันทำการ",
  },
  {
    icon: "🔴",
    title: "อาหารมีปัญหาด้านความปลอดภัย",
    desc: "พบสิ่งแปลกปลอมในอาหารหรืออาหารบูด โปรดถ่ายภาพหลักฐานและติดต่อภายใน 2 ชั่วโมง",
    eligible: true,
    timeline: "พิจารณาเร่งด่วนภายใน 1 วันทำการ",
  },
  {
    icon: "🕐",
    title: "ยกเลิกหลัง 1 นาที (ร้านกำลังทำ)",
    desc: "ออเดอร์ที่ร้านค้าเริ่มเตรียมอาหารแล้ว ไม่สามารถยกเลิกได้ตามปกติ",
    eligible: false,
  },
  {
    icon: "😕",
    title: "ไม่พอใจรสชาติ",
    desc: "ความพอใจในรสชาติเป็นเรื่องส่วนตัว หากไม่มีปัญหาด้านคุณภาพหรือความปลอดภัย",
    eligible: false,
  },
  {
    icon: "🌧️",
    title: "จัดส่งล่าช้าเนื่องจากสภาพอากาศ",
    desc: "สภาพอากาศแปรปรวน น้ำท่วม หรือเหตุสุดวิสัยที่อยู่นอกเหนือการควบคุม",
    eligible: false,
  },
];

const STEPS = [
  { step: "1", text: "ถ่ายภาพหลักฐาน (อาหาร, บิล, ข้อความแจ้งยกเลิก)" },
  { step: "2", text: "ติดต่อ LINE @thoetthai พร้อมรหัสออเดอร์ (เช่น TT-0038)" },
  { step: "3", text: "ทีมงานตรวจสอบและแจ้งผลภายใน 24 ชั่วโมง" },
  { step: "4", text: "หากอนุมัติ จะคืนเงินเข้าช่องทางเดิมที่ชำระ" },
];

export default function RefundPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-dvh bg-surface-bg">
      <div className="sticky top-0 bg-surface-bg border-b border-border px-4 py-3 flex items-center gap-2 z-10">
        <Link href="javascript:history.back()" className="w-9 h-9 rounded-[10px] grid place-items-center text-text-primary hover:bg-surface-card transition-colors">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </Link>
        <div className="text-base font-semibold text-text-primary">นโยบายการคืนเงิน</div>
      </div>

      <div className="p-6">
        <p className="text-xs text-text-tertiary mb-6">มีผลบังคับใช้ตั้งแต่วันที่ 1 เมษายน 2569</p>

        {/* Cases */}
        <h2 className="text-sm font-semibold text-text-primary mb-3">กรณีที่คืนเงินได้ / ไม่ได้</h2>
        <div className="flex flex-col gap-2 mb-8">
          {CASES.map((c) => (
            <div
              key={c.title}
              className="bg-surface-card rounded-card border border-border p-3.5 flex gap-3 items-start"
            >
              <span className="text-lg shrink-0 mt-0.5">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-text-primary">{c.title}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      c.eligible
                        ? "bg-status-success-bg text-status-success"
                        : "bg-status-danger-bg text-status-danger"
                    }`}
                  >
                    {c.eligible ? "คืนได้" : "คืนไม่ได้"}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{c.desc}</p>
                {c.timeline && (
                  <p className="text-[11px] text-brand-secondary mt-1 font-medium">{c.timeline}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <h2 className="text-sm font-semibold text-text-primary mb-3">ขั้นตอนการขอคืนเงิน</h2>
        <div className="flex flex-col gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-semibold grid place-items-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed pt-1">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-brand-primary-light rounded-card px-4 py-3.5 text-sm text-brand-primary leading-relaxed">
          <span className="font-semibold">ติดต่อขอคืนเงิน:</span> LINE @thoetthai<br />
          <span className="text-xs opacity-80">เปิดทำการ จ.–ศ. 08:00–17:00 น. · อาทิตย์ปิดทำการ</span>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-text-tertiary text-center">
            เทอดไทย เดลิเวอรี่ · v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
