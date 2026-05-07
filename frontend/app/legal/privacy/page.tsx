import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "นโยบายความเป็นส่วนตัว — เทอดไทย เดลิเวอรี่" };

const SECTIONS = [
  {
    title: "1. ข้อมูลที่เราเก็บรวบรวม",
    body: `เราเก็บรวบรวมข้อมูลดังนี้:
• ข้อมูลบัญชี LINE: ชื่อ รูปโปรไฟล์ LINE User ID
• ข้อมูลติดต่อ: หมายเลขโทรศัพท์ที่คุณให้ไว้
• ข้อมูลที่อยู่จัดส่ง: ที่อยู่จัดส่งที่คุณบันทึก
• ข้อมูลธุรกรรม: ออเดอร์ รายการซื้อขาย ประวัติการชำระเงิน
• ข้อมูลอุปกรณ์: IP address, ประเภทอุปกรณ์, ระบบปฏิบัติการ`,
  },
  {
    title: "2. วัตถุประสงค์การใช้ข้อมูล",
    body: `เราใช้ข้อมูลของคุณเพื่อ:
• ให้บริการสั่งซื้อและจัดส่งอาหาร
• แจ้งสถานะออเดอร์ผ่าน LINE Notification
• คำนวณรายได้และการชำระเงินให้ร้านค้าและไรเดอร์
• ปรับปรุงบริการและแก้ไขปัญหา
• ป้องกันการทุจริตและรักษาความปลอดภัย`,
  },
  {
    title: "3. การเปิดเผยข้อมูลแก่บุคคลที่สาม",
    body: "เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลแก่บุคคลภายนอก เราอาจเปิดเผยข้อมูลแก่ร้านค้าและไรเดอร์เท่าที่จำเป็นเพื่อดำเนินการออเดอร์ เช่น ชื่อลูกค้าและที่อยู่จัดส่ง และอาจเปิดเผยตามคำสั่งของหน่วยงานรัฐตามที่กฎหมายกำหนด",
  },
  {
    title: "4. ระยะเวลาเก็บรักษาข้อมูล",
    body: "เราเก็บข้อมูลส่วนบุคคลตราบเท่าที่จำเป็นสำหรับวัตถุประสงค์ที่ระบุ ข้อมูลธุรกรรมเก็บไว้ 5 ปีตามกฎหมายบัญชี ข้อมูลบัญชีผู้ใช้เก็บจนกว่าคุณจะขอลบบัญชี",
  },
  {
    title: "5. สิทธิของเจ้าของข้อมูล (PDPA)",
    body: `ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิ์:
• เข้าถึงและขอสำเนาข้อมูลของคุณ
• แก้ไขข้อมูลที่ไม่ถูกต้อง
• ลบข้อมูล (Right to Erasure)
• คัดค้านการประมวลผลข้อมูล
• โอนย้ายข้อมูล (Data Portability)
ใช้สิทธิ์ได้โดยติดต่อ LINE @thoetthai เราจะดำเนินการภายใน 30 วัน`,
  },
  {
    title: "6. ความปลอดภัยของข้อมูล",
    body: "เราใช้การเข้ารหัส HTTPS/TLS สำหรับการรับส่งข้อมูล และ bcrypt สำหรับรหัสผ่าน ข้อมูลบัตรเครดิตไม่ถูกเก็บบนเซิร์ฟเวอร์ของเรา การชำระเงินผ่านระบบของธนาคารโดยตรง",
  },
  {
    title: "7. คุกกี้และการติดตาม",
    body: "เราใช้คุกกี้เพื่อจัดการ session การเข้าสู่ระบบเท่านั้น ไม่มีการติดตามพฤติกรรมเพื่อโฆษณา ไม่มีการแชร์ข้อมูลกับ Google Analytics หรือ Meta Pixel",
  },
  {
    title: "8. การติดต่อ",
    body: "หากมีข้อสงสัยเกี่ยวกับนโยบายนี้หรือต้องการใช้สิทธิ์ของเจ้าของข้อมูล ติดต่อได้ที่ LINE @thoetthai หรืออีเมล privacy@thoetthai.com",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-dvh bg-surface-bg">
      <div className="sticky top-0 bg-surface-bg border-b border-border px-4 py-3 flex items-center gap-2 z-10">
        <Link href="javascript:history.back()" className="w-9 h-9 rounded-[10px] grid place-items-center text-text-primary hover:bg-surface-card transition-colors">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </Link>
        <div className="text-base font-semibold text-text-primary">นโยบายความเป็นส่วนตัว</div>
      </div>

      <div className="p-6">
        <div className="bg-brand-primary-light rounded-card px-4 py-3 text-xs text-brand-primary leading-relaxed mb-6">
          เทอดไทย เดลิเวอรี่ ให้ความสำคัญกับความเป็นส่วนตัวของคุณตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562
        </div>
        <p className="text-xs text-text-tertiary mb-6">มีผลบังคับใช้ตั้งแต่วันที่ 1 เมษายน 2569 · ปรับปรุงล่าสุด 30 เมษายน 2569</p>

        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h2 className="text-sm font-semibold text-text-primary mb-2">{sec.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-text-tertiary text-center leading-relaxed">
            ติดต่อ DPO: LINE @thoetthai · privacy@thoetthai.com<br />
            เทอดไทย เดลิเวอรี่ · ตำบลเทอดไทย อำเภอแม่ฟ้าหลวง เชียงราย 57240
          </p>
        </div>
      </div>
    </div>
  );
}
