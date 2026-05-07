"use client";

import { X, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { useToastStore } from "@/stores/toast";
import { cn } from "@/lib/utils";

const STYLES = {
  error:   { bar: "bg-status-danger",   icon: AlertCircle,   text: "text-status-danger"   },
  success: { bar: "bg-status-success",  icon: CheckCircle2,  text: "text-status-success"  },
  warning: { bar: "bg-status-warning",  icon: AlertTriangle, text: "text-status-warning"  },
};

export function Toast() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(({ id, type, message }) => {
        const { bar, icon: Icon, text } = STYLES[type];
        return (
          <div
            key={id}
            className="pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-lg border border-border px-4 py-3 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden relative"
          >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", bar)} />
            <Icon size={18} className={cn("shrink-0 mt-0.5", text)} />
            <p className="flex-1 text-sm text-text-primary leading-snug">{message}</p>
            <button onClick={() => dismiss(id)} className="shrink-0 text-text-tertiary">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
