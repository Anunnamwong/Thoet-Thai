"use client";

import { useNotificationStore } from "@/stores/notification";
import { Bell, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function NotificationOverlay() {
  const { current, clearNotification } = useNotificationStore();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (current?.type === "NEW_ORDER") {
      // Play alert sound if available
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      // Vibrate if mobile
      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  }, [current]);

  if (!current) return null;

  const isNewOrder = current.type === "NEW_ORDER";

  const handleAction = () => {
    if (isNewOrder) {
      router.push("/merchant/orders");
    }
    clearNotification();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" 
        preload="auto"
      />
      
      <div 
        className={cn(
          "w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center",
          isNewOrder ? "bg-brand-primary text-white" : "bg-white text-text-primary"
        )}
      >
        <div className="flex justify-center mb-6">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center animate-bounce",
            isNewOrder ? "bg-white text-brand-primary" : "bg-brand-primary/10 text-brand-primary"
          )}>
            {isNewOrder ? <ShoppingBag size={40} /> : <Bell size={40} />}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
        <p className={cn(
          "text-lg mb-8",
          isNewOrder ? "text-white/90" : "text-text-secondary"
        )}>
          {current.message}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAction}
            className={cn(
              "w-full h-14 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform",
              isNewOrder ? "bg-white text-brand-primary" : "bg-brand-primary text-white"
            )}
          >
            {isNewOrder ? "ดูออเดอร์" : "ตกลง"}
          </button>
          
          <button
            onClick={clearNotification}
            className={cn(
              "w-full h-12 rounded-2xl font-semibold opacity-80",
              isNewOrder ? "text-white" : "text-text-secondary"
            )}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
