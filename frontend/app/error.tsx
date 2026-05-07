"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-surface-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">เกิดข้อผิดพลาด</h1>
      <p className="text-sm text-text-secondary mb-8 max-w-xs leading-relaxed">
        มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาติดต่อ LINE @thoetthai
      </p>
      <button
        onClick={reset}
        className="px-6 h-11 rounded-btn bg-brand-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
