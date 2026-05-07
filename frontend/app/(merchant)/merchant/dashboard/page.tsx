"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  UtensilsCrossed,
  Clock,
  BarChart2,
} from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useToastStore } from "@/stores/toast";

interface ShopDetail {
  id: string;
  name: string;
  is_open: boolean;
}

interface OrderListItem {
  id: string;
  status: string;
  total: number;
  created_at: string;
  item_count: number;
}

interface RevenueStats {
  today: { gross: number; orders: number; avg: number };
}

const ACTIVE_STATUSES = new Set(["paid", "preparing", "ready_for_pickup", "rider_assigned", "picked_up"]);
const COOKING_STATUSES = new Set(["paid", "preparing"]);
const WAITING_STATUSES = new Set(["ready_for_pickup", "rider_assigned"]);

function StatTile({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface-card rounded-card border border-border p-3.5">
      <div className="text-xs text-text-secondary mb-1">{label}</div>
      <div
        className={cn(
          "text-[26px] font-bold tabular-nums leading-tight",
          accent ? "text-brand-primary" : "text-text-primary"
        )}
      >
        {value}
      </div>
      {unit && <div className="text-xs text-text-secondary mt-0.5">{unit}</div>}
      {sub && <div className="text-[11px] text-text-tertiary mt-1">{sub}</div>}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative bg-surface-card rounded-card border border-border p-3.5 flex flex-col gap-2 min-h-[88px] text-left"
    >
      <div className="w-9 h-9 rounded-[10px] bg-brand-primary-light text-brand-primary grid place-items-center">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="text-sm font-semibold text-text-primary leading-snug">{label}</div>
      {badge && badge > 0 ? (
        <span className="absolute top-2.5 right-2.5 min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand-primary text-white text-xs font-bold grid place-items-center">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function MerchantDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const { data: shopData } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => api.getMyShop() as Promise<ApiResponse<ShopDetail>>,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["merchant-orders"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["merchant-revenue"],
    queryFn: () => api.getMerchantRevenue() as Promise<ApiResponse<RevenueStats>>,
  });

  const toggleMutation = useMutation({
    mutationFn: (shopId: string) => api.toggleShop(shopId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["my-shop"] });
      const previousShop = queryClient.getQueryData<ApiResponse<ShopDetail>>(["my-shop"]);
      
      if (previousShop?.data) {
        queryClient.setQueryData(["my-shop"], {
          ...previousShop,
          data: { ...previousShop.data, is_open: !previousShop.data.is_open }
        });
      }
      return { previousShop };
    },
    onError: (err, _, context) => {
      if (context?.previousShop) {
        queryClient.setQueryData(["my-shop"], context.previousShop);
      }
      toast("ไม่สามารถเปลี่ยนสถานะร้านได้: " + (err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
    },
  });

  const shop = shopData?.data;
  const shopOpen = shop?.is_open ?? true;
  const shopName = shop?.name ?? "ร้านของคุณ";

  const allOrders = ordersData?.data ?? [];
  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const cookingCount = activeOrders.filter((o) => COOKING_STATUSES.has(o.status)).length;
  const waitingCount = activeOrders.filter((o) => WAITING_STATUSES.has(o.status)).length;
  const alertCount = activeOrders.length;

  const todayStats = revenueData?.data?.today;
  const todayOrders = todayStats?.orders ?? 0;
  const todayRevenue = todayStats?.gross ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-12 pb-4">
        {/* Greeting */}
        <div className="mb-3.5">
          <div className="text-sm text-text-secondary">สวัสดีค่ะ</div>
          <div className="text-xl font-semibold text-text-primary">{shopName}</div>
        </div>

        {/* Shop open/close toggle */}
        <div
          className={cn(
            "rounded-modal p-4 mb-4 border-2",
            shopOpen
              ? "bg-status-success-bg border-status-success"
              : "bg-status-danger-bg border-status-danger"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className={cn(
                "w-3.5 h-3.5 rounded-full shrink-0",
                shopOpen
                  ? "bg-status-success shadow-[0_0_0_4px_rgba(45,106,79,0.2)]"
                  : "bg-status-danger"
              )}
            />
            <div className="flex-1">
              <div
                className={cn(
                  "text-lg font-semibold",
                  shopOpen ? "text-status-success" : "text-status-danger"
                )}
              >
                {shopOpen ? "ร้านเปิดอยู่" : "ร้านปิดอยู่"}
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                {shopOpen ? "รับออเดอร์ได้ปกติ" : "ลูกค้าจะเห็นว่าปิด"}
              </div>
            </div>
          </div>
          <button
            onClick={() => shop?.id && toggleMutation.mutate(shop.id)}
            disabled={toggleMutation.isPending || !shop}
            className={cn(
              "w-full h-[52px] rounded-card text-white text-lg font-semibold disabled:opacity-60",
              shopOpen ? "bg-status-danger" : "bg-status-success"
            )}
          >
            {shopOpen ? "ปิดร้าน" : "เปิดร้าน"}
          </button>
        </div>

        {/* Stats */}
        <div className="text-base font-semibold text-text-primary mb-2">วันนี้</div>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatTile label="ออเดอร์" value={todayOrders} unit="รายการ" />
          <StatTile
            label="รายได้"
            value={`฿${todayRevenue.toLocaleString("th-TH")}`}
            accent
          />
          <StatTile label="กำลังทำ" value={cookingCount} unit="รายการ" />
          <StatTile label="รอไรเดอร์" value={waitingCount} unit="รายการ" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <ActionTile
            icon={ClipboardList}
            label="ดูออเดอร์ทั้งหมด"
            badge={alertCount}
            onClick={() => router.push("/merchant/orders")}
          />
          <ActionTile
            icon={UtensilsCrossed}
            label="จัดการเมนู"
            onClick={() => router.push("/merchant/menu")}
          />
          <ActionTile
            icon={Clock}
            label="เวลาเปิด-ปิด"
            onClick={() => router.push("/merchant/hours")}
          />
          <ActionTile
            icon={BarChart2}
            label="รายได้รายสัปดาห์"
            onClick={() => router.push("/merchant/revenue")}
          />
        </div>

        {/* Active orders banner */}
        {alertCount > 0 && (
          <button
            onClick={() => router.push("/merchant/orders")}
            className="w-full bg-brand-primary-light rounded-modal p-3.5 border-[1.5px] border-brand-primary flex items-center gap-3 text-left"
          >
            <div className="w-11 h-11 rounded-card bg-brand-primary text-white grid place-items-center text-xl font-bold shrink-0">
              {alertCount}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-brand-primary">มีออเดอร์ที่ต้องดู</div>
              <div className="text-sm text-text-secondary mt-0.5">กดเพื่อดูรายละเอียด</div>
            </div>
            <ChevronRight size={20} className="text-brand-primary shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
