import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "ข้อกำหนดและเงื่อนไข — เทอดไทย เดลิเวอรี่" };

const SECTIONS = [
  {
    title: "1. การยอมรับข้อกำหนด",
    body: "การใช้บริการแพลตฟอร์มเทอดไทย เดลิเวอรี่ ถือว่าผู้ใช้ได้อ่านและยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทุกประการ หากไม่ยอมรับ กรุณาหยุดใช้บริการ บริษัทขอสงวนสิทธิ์แก้ไขข้อกำหนดได้ตลอดเวลาโดยแจ้งผ่านแอปพลิเคชัน",
  },
  {
    title: "2. บริการที่ให้",
    body: "เทอดไทย เดลิเวอรี่ เป็นแพลตฟอร์มเชื่อมต่อระหว่างลูกค้า ร้านค้า และไรเดอร์ในพื้นที่ตำบลเทอดไทย อำเภอแม่ฟ้าหลวง จังหวัดเชียงราย บริษัทไม่ได้เป็นเจ้าของร้านอาหารหรือยานพาหนะส่งของแต่อย่างใด",
  },
  {
    title: "3. การสั่งซื้อและชำระเงิน",
    body: "ออเดอร์ถือว่าสมบูรณ์เมื่อร้านค้ายืนยันรับออเดอร์แล้ว ราคาสินค้ารวมค่าจัดส่งตามที่แสดงในแอป รองรับการชำระด้วยเงินสดปลายทาง (COD) และพร้อมเพย์ (PromptPay) กรณีชำระพร้อมเพย์ ต้องสแกน QR ภายใน 15 นาที มิฉะนั้นออเดอร์จะถูกยกเลิกอัตโนมัติ",
  },
  {
    title: "4. การยกเลิกออเดอร์",
    body: "ลูกค้ายกเลิกได้ภายใน 1 นาทีหลังสั่งซื้อ ก่อนที่ร้านเริ่มเตรียมอาหาร หลังจากนั้นการยกเลิกขึ้นอยู่กับดุลยพินิจของร้านค้า กรณีร้านค้าไม่รับออเดอร์หรือปิดให้บริการ ลูกค้าจะได้รับเงินคืนเต็มจำนวนตามนโยบายการคืนเงิน",
  },
  {
    title: "5. ความรับผิดชอบของร้านค้า",
    body: "ร้านค้ารับผิดชอบต่อคุณภาพอาหาร ความถูกต้องของออเดอร์ และการแสดงข้อมูลส่วนผสม (รวมถึงสารก่อภูมิแพ้) บนแอปอย่างครบถ้วน บริษัทไม่รับผิดชอบต่อปัญหาด้านคุณภาพอาหารหรือการแพ้อาหาร",
  },
  {
    title: "6. ความรับผิดชอบของไรเดอร์",
    body: "ไรเดอร์ต้องมีใบขับขี่และประกันภัยที่ถูกต้องตามกฎหมาย รับผิดชอบต่อความเสียหายของอาหารระหว่างการจัดส่งอันเกิดจากความประมาท บริษัทไม่ใช่นายจ้างของไรเดอร์",
  },
  {
    title: "7. การระงับบัญชี",
    body: "บริษัทขอสงวนสิทธิ์ระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนด โกง ใช้บัญชีในทางมิชอบ หรือส่งผลเสียต่อผู้ใช้งานอื่นและชุมชน",
  },
  {
    title: "8. กฎหมายที่ใช้บังคับ",
    body: "ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทให้อยู่ในอำนาจศาลไทย บริษัทตั้งอยู่ในจังหวัดเชียงราย ประเทศไทย",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-dvh bg-surface-bg">
      <div className="sticky top-0 bg-surface-bg border-b border-border px-4 py-3 flex items-center gap-2 z-10">
        <Link href="javascript:history.back()" className="w-9 h-9 rounded-[10px] grid place-items-center text-text-primary hover:bg-surface-card transition-colors">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </Link>
        <div className="text-base font-semibold text-text-primary">ข้อกำหนดและเงื่อนไข</div>
      </div>

      <div className="p-6">
        <p className="text-xs text-text-tertiary mb-6">มีผลบังคับใช้ตั้งแต่วันที่ 1 เมษายน 2569</p>

        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h2 className="text-sm font-semibold text-text-primary mb-2">{sec.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-text-tertiary text-center leading-relaxed">
            หากมีข้อสงสัยเกี่ยวกับข้อกำหนดนี้ ติดต่อเราได้ที่ LINE @thoetthai<br />
            เทอดไทย เดลิเวอรี่ · v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
