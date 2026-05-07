"use client";
import { create } from "zustand";

type ToastType = "error" | "success" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

let _id = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (message, type = "error") => {
    const id = ++_id;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
