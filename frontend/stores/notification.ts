import { create } from "zustand";

interface Notification {
  type: "NEW_ORDER" | "ORDER_STATUS" | "SYSTEM";
  title: string;
  message: string;
  data?: any;
}

interface NotificationState {
  current: Notification | null;
  showNotification: (notification: Notification) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  current: null,
  showNotification: (notification) => set({ current: notification }),
  clearNotification: () => set({ current: null }),
}));
