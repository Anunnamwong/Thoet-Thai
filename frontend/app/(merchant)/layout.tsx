"use client";

import { MerchantBottomNav } from "@/components/shared/MerchantBottomNav";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, OrderListItem } from "@/types";

const ACTIVE_STATUSES = new Set(["paid", "preparing", "ready_for_pickup"]);

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { data: ordersData } = useQuery({
    queryKey: ["merchant-orders"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,
  });

  const allOrders = ordersData?.data ?? [];
  const activeCount = allOrders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-surface-bg">
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      <MerchantBottomNav alertCount={activeCount} />
    </div>
  );
}
