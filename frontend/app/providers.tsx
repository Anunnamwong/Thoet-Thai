"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { RealtimeHandler } from "@/components/shared/RealtimeHandler";
import { NotificationOverlay } from "@/components/shared/NotificationOverlay";
import { PDPAConsent } from "@/components/shared/PDPAConsent";
import { Toast } from "@/components/shared/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeHandler />
      <NotificationOverlay />
      <PDPAConsent />
      <Toast />
      {children}
    </QueryClientProvider>
  );
}
