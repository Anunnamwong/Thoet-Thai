"use client";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  dark?: boolean;
}

export function ScreenHeader({ title, sub, onBack, right, dark }: ScreenHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 pt-12 pb-2.5 border-b shrink-0",
        dark ? "bg-text-primary border-white/20" : "bg-surface-bg border-border"
      )}
    >
      {onBack && (
        <button
          onClick={onBack}
          className={cn(
            "w-[38px] h-[38px] rounded-[10px] grid place-items-center shrink-0",
            dark ? "text-white" : "text-text-primary"
          )}
          aria-label="ย้อนกลับ"
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-base font-semibold truncate",
            dark ? "text-white" : "text-text-primary"
          )}
        >
          {title}
        </div>
        {sub && (
          <div
            className={cn(
              "text-xs mt-0.5 truncate",
              dark ? "text-white/70" : "text-text-secondary"
            )}
          >
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}
