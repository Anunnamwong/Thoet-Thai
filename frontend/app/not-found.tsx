import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-surface-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🍜</div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">ไม่พบหน้านี้</h1>
      <p className="text-sm text-text-secondary mb-8 max-w-xs leading-relaxed">
        หน้าที่คุณกำลังมองหาอาจถูกย้ายหรือไม่มีอยู่แล้ว
      </p>
      <Link
        href="/"
        className="px-6 h-11 rounded-btn bg-brand-primary text-white text-sm font-semibold grid place-items-center hover:opacity-90 transition-opacity"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
