"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Clock, Loader2, Upload } from "lucide-react";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useToastStore } from "@/stores/toast";

interface PaymentResponse {
  id: string;
  qr_payload: string;
  amount: number;
  status: string;
}

function PaymentContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToastStore();
  const orderId = params.get("order_id");
  const amount = Number(params.get("amount") ?? 0);
  const [secs, setSecs] = useState(15 * 60);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchQR() {
      if (!orderId) return;
      try {
        const res = await api.generatePromptPayQR(orderId) as ApiResponse<PaymentResponse>;
        if (res.success && res.data) {
          setQrPayload(res.data.qr_payload);
        } else {
          setError(res.error ?? "ไม่สามารถสร้าง QR Code ได้");
        }
      } catch {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      } finally {
        setLoading(false);
      }
    }
    fetchQR();
  }, [orderId]);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;

    setUploading(true);
    try {
      // 1. Upload slip to Supabase
      const uploadRes = await api.uploadImage(file);
      if (uploadRes.success) {
        const slipUrl =
          uploadRes.data && typeof uploadRes.data === "object" && "url" in uploadRes.data
            ? String(uploadRes.data.url)
            : undefined;
        // MVP mock path: payment service confirms the order; customer UI never
        // updates operational order status directly.
        await api.mockConfirmPromptPay(orderId, slipUrl);
        router.push(`/orders/${orderId}`);
      }
    } catch {
      toast("อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่ค่ะ");
    } finally {
      setUploading(false);
    }
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="flex flex-col h-full bg-surface-bg overflow-hidden">
      <ScreenHeader title="พร้อมเพย์" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-3.5">
        {/* QR Card */}
        <div className="bg-surface-card rounded-modal border border-border p-5 w-full text-center relative overflow-hidden">
          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
              <div className="text-sm font-bold text-text-primary">กำลังตรวจสอบสลิป...</div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#003087] text-white grid place-items-center text-xs font-bold shadow-sm">
                PP
              </div>
              <span className="text-base font-bold text-text-primary">PromptPay</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tabular-nums",
              secs < 60 ? "bg-status-danger-bg text-status-danger animate-pulse" : "bg-surface-bg text-text-secondary"
            )}>
              <Clock size={10} />
              {mm}:{ss}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="aspect-square w-full max-w-[260px] mx-auto bg-white p-4 rounded-[24px] border-[1.5px] border-border shadow-sm flex items-center justify-center relative">
            {loading ? (
              <div className="w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
            ) : qrPayload ? (
              <QRCodeCanvas value={qrPayload} size={220} level="H" includeMargin={false} />
            ) : (
              <div className="text-xs text-status-danger">{error}</div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-xs text-text-secondary mb-1 uppercase tracking-widest">ยอดที่ต้องโอน</div>
            <div className="text-[32px] font-extrabold text-text-primary tabular-nums tracking-tight">
              ฿{amount.toLocaleString("th-TH")}
            </div>
            <div className="text-xs text-brand-primary font-medium mt-1">ผู้รับเงิน · เทอดไทย เดลิเวอรี่</div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-surface-card rounded-modal border border-border p-4">
          <div className="text-sm font-bold text-text-primary mb-3">ขั้นตอนสุดท้าย</div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-14 rounded-xl border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 flex items-center justify-center gap-3 text-brand-primary font-bold active:scale-95 transition-transform"
          >
            <Upload size={20} />
            อัปโหลดสลิปยืนยัน
          </button>
          <p className="text-[11px] text-text-tertiary text-center mt-3">
            *กรุณาอัปโหลดสลิปเพื่อให้ร้านค้าเริ่มทำอาหารทันทีค่ะ
          </p>
        </div>

        {/* Instructions */}
        <div className="p-1">
          <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">วิธีชำระเงิน</div>
          <div className="space-y-2">
            {[
              "บันทึกรูป QR Code หรือสแกนจากหน้าจอนี้",
              "เปิดแอปธนาคารของคุณและเลือก 'สแกนจ่าย'",
              "ตรวจสอบยอดเงินให้ตรงกับหน้าจอ (฿" + amount.toLocaleString() + ")",
              "อัปโหลดสลิปในปุ่มด้านบนเพื่อยืนยัน"
            ].map((step, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-4 h-4 rounded-full bg-border text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="text-xs text-text-secondary leading-relaxed">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 pb-5 bg-surface-bg border-t border-border flex gap-2 shrink-0">
        <button
          onClick={() => router.back()}
          className="h-[52px] px-6 rounded-xl border border-border bg-surface-card text-sm font-bold text-text-secondary active:scale-95 transition-transform"
        >
          ยกเลิก
        </button>
        <button
          onClick={() => router.push(`/orders/${orderId}`)}
          className="flex-1 h-[52px] rounded-xl bg-text-primary text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
          disabled={!orderId || uploading}
        >
          ติดตามออเดอร์
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
