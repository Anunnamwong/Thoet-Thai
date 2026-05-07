"use client";

import { RiderBottomNav } from "@/components/shared/RiderBottomNav";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, OrderListItem } from "@/types";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { data: profileRes } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: () => api.getRiderProfile() as Promise<ApiResponse<{ status: string }>>,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["rider-active-jobs"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,
  });

  const online = profileRes?.data?.status === "online";
  const activeCount = ordersData?.data?.filter((o) => 
    ["rider_assigned", "picked_up"].includes(o.status)
  ).length || 0;

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-surface-bg">
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      <RiderBottomNav online={online} alertCount={activeCount} />
    </div>
  );
}
