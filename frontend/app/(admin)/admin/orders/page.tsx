"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, X, MapPin, Store, User as UserIcon, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse, OrderListItem, OrderStatus, Order } from "@/types";

type StatusTabKey = "all" | "pending" | "preparing" | "delivering" | "done" | "cancelled";

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "preparing",
  "ready_for_pickup",
  "rider_assigned",
  "picked_up",
  "delivered",
  "cancelled",
  "refunded",
];

const TABS: { key: StatusTabKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอยืนยัน" },
  { key: "preparing", label: "กำลังทำ" },
  { key: "delivering", label: "กำลังส่ง" },
  { key: "done", label: "สำเร็จ" },
  { key: "cancelled", label: "ยกเลิก" },
];

const STATUS_MAP: Record<string, StatusTabKey> = {
  pending_payment: "pending",
  paid: "pending",
  preparing: "preparing",
  ready_for_pickup: "preparing",
  rider_assigned: "delivering",
  picked_up: "delivering",
  delivered: "done",
  cancelled: "cancelled",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "รอจ่ายเงิน",
  paid: "รอร้านยืนยัน",
  preparing: "กำลังทำ",
  ready_for_pickup: "พร้อมส่ง",
  rider_assigned: "ไรเดอร์รับแล้ว",
  picked_up: "กำลังส่ง",
  delivered: "สำเร็จ",
  cancelled: "ยกเลิก",
  refunded: "คืนเงินแล้ว",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-brand-primary-light text-brand-primary",
  preparing: "bg-status-warning-bg text-status-warning",
  delivering: "bg-brand-secondary-light text-brand-secondary",
  done: "bg-status-success-bg text-status-success",
  cancelled: "bg-surface-bg text-text-tertiary border border-border",
};

const ADMIN_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ["pending_payment", "paid", "cancelled"],
  paid: ["paid", "preparing", "ready_for_pickup", "cancelled"],
  preparing: ["preparing", "ready_for_pickup"],
  ready_for_pickup: ["ready_for_pickup"],
  rider_assigned: ["rider_assigned"],
  picked_up: ["picked_up"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
  refunded: ["refunded"],
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<StatusTabKey>("all");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,
  });

  const orders = orderRes?.data ?? [];

  // Detail Query
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ["admin-order-detail", selectedOrderId],
    queryFn: () => api.getOrder(selectedOrderId!) as Promise<ApiResponse<Order>>,
    enabled: !!selectedOrderId,
  });

  const orderDetail = detailRes?.data;
  const statusOptions = orderDetail
    ? ADMIN_STATUS_OPTIONS[orderDetail.status] ?? [orderDetail.status]
    : ALL_ORDER_STATUSES;

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => api.updateOrderStatus(selectedOrderId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", selectedOrderId] });
    },
  });

  const filtered = orders.filter((o) => {
    const statusKey = STATUS_MAP[o.status] || "all";
    const matchTab = tab === "all" || statusKey === tab;
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_number.toLowerCase().includes(q) || (o.shop_name || "").toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-card shrink-0">
        <div className="text-lg font-semibold text-text-primary mb-3">จัดการออเดอร์ (ข้อมูลจริง)</div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัส หรือ ร้านค้า..."
              className="w-full pl-8 pr-3 h-9 rounded-btn border border-border bg-surface-bg text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto hide-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                tab === t.key
                  ? "bg-brand-primary text-white"
                  : "bg-surface-bg text-text-secondary border border-border hover:border-brand-primary hover:text-brand-primary"
              )}
            >
              {t.label}
              {t.key !== "all" && (
                <span className="ml-1.5 opacity-70">
                  {orders.filter((o) => STATUS_MAP[o.status] === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
            <div className="text-sm text-text-secondary">กำลังดึงข้อมูลออเดอร์...</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-surface-bg border-b border-border z-10">
              <tr className="text-[11px] text-text-tertiary uppercase tracking-wider">
                <th className="px-6 py-2.5 text-left font-medium">รหัส</th>
                <th className="px-4 py-2.5 text-left font-medium">ร้านค้า</th>
                <th className="px-4 py-2.5 text-left font-medium">สถานะ</th>
                <th className="px-4 py-2.5 text-left font-medium">วิธีจ่าย</th>
                <th className="px-4 py-2.5 text-right font-medium">ยอด</th>
                <th className="px-4 py-2.5 text-right font-medium">วันเวลา</th>
              </tr>
            </thead>
            <tbody className="bg-surface-card">
              {filtered.map((order, idx) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={cn(
                    "text-sm hover:bg-surface-bg transition-colors cursor-pointer",
                    idx > 0 && "border-t border-border"
                  )}
                >
                  <td className="px-6 py-3 font-medium text-brand-primary font-mono">{order.order_number}</td>
                  <td className="px-4 py-3 text-text-primary">{order.shop_name}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", STATUS_CLASS[STATUS_MAP[order.status] || "all"])}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{order.payment_method}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-text-primary">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary text-xs">
                    {new Date(order.created_at).toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary text-sm">
                    ไม่พบออเดอร์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over Detail */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setSelectedOrderId(null)}
          />
          <div className="relative w-full max-w-md bg-surface-bg shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-card flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-text-primary">รายละเอียดออเดอร์</h3>
                <p className="text-xs text-brand-primary font-mono font-bold">
                  {orderDetail?.order_number || "กำลังโหลด..."}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-bg grid place-items-center text-text-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
                  <div className="text-sm text-text-secondary">กำลังโหลดรายละเอียด...</div>
                </div>
              ) : orderDetail ? (
                <>
                  {/* Status Override */}
                  <div className="bg-surface-card rounded-card border border-border p-4">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider block mb-2">
                      สถานะออเดอร์ (Override)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={orderDetail.status}
                        onChange={(e) => updateStatusMutation.mutate(e.target.value as OrderStatus)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 h-10 px-3 rounded-btn border border-border bg-surface-bg text-sm font-semibold text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                          </option>
                        ))}
                      </select>
                    </div>
                    {updateStatusMutation.isPending && (
                      <p className="text-[10px] text-brand-primary mt-1.5 animate-pulse">กำลังอัปเดตสถานะ...</p>
                    )}
                  </div>

                  {/* Merchant & Customer */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-card rounded-card border border-border p-3">
                      <div className="flex items-center gap-2 text-brand-primary mb-1">
                        <Store size={14} />
                        <span className="text-xs font-bold">ร้านค้า</span>
                      </div>
                      <div className="text-sm font-bold text-text-primary truncate">{orderDetail.shop?.name}</div>
                    </div>
                    <div className="bg-surface-card rounded-card border border-border p-3">
                      <div className="flex items-center gap-2 text-brand-secondary mb-1">
                        <UserIcon size={14} />
                        <span className="text-xs font-bold">ลูกค้า</span>
                      </div>
                      <div className="text-sm font-bold text-text-primary truncate">
                        ID: {orderDetail.customer_id.slice(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-surface-card rounded-card border border-border p-4">
                    <div className="flex items-center gap-2 text-text-tertiary mb-2">
                      <MapPin size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">ที่อยู่จัดส่ง</span>
                    </div>
                    <div className="text-sm text-text-primary leading-relaxed">{orderDetail.delivery_address}</div>
                  </div>

                  {/* Items */}
                  <div className="bg-surface-card rounded-card border border-border p-4">
                    <div className="flex items-center gap-2 text-text-tertiary mb-3">
                      <Package size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">รายการอาหาร ({orderDetail.items.length})</span>
                    </div>
                    <div className="space-y-3">
                      {orderDetail.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-text-primary">
                              <span className="text-brand-primary mr-1.5">{item.quantity}×</span>
                              {item.item_name}
                            </div>
                            {item.selected_options.length > 0 && (
                              <div className="text-xs text-text-tertiary mt-0.5">
                                {item.selected_options.map((opt) => opt.choice).join(", ")}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-bold text-text-primary tabular-nums">
                            {formatPrice(item.line_total)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-border my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>ค่าอาหาร</span>
                        <span className="tabular-nums font-medium">{formatPrice(orderDetail.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>ค่าจัดส่ง</span>
                        <span className="tabular-nums font-medium">{formatPrice(orderDetail.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold text-text-primary">ยอดรวมทั้งหมด</span>
                        <span className="text-xl font-extrabold text-brand-primary tabular-nums">
                          {formatPrice(orderDetail.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-status-danger font-bold">ไม่พบข้อมูลออเดอร์</div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border bg-surface-card shrink-0">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-full h-12 rounded-btn bg-surface-bg border border-border text-text-primary font-bold hover:bg-surface-card transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
