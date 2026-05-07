"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { cn, formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useToastStore } from "@/stores/toast";
import { CheckCircle2, XCircle, Clock, Loader2, Timer, X, MapPin, ReceiptText, Wallet } from "lucide-react";

interface OrderListItem {
  id: string;
  order_number: string;
  shop_id: string;
  shop_name: string | null;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  item_count: number;
  created_at: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  delivery_address: string;
  delivery_note?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  items: {
    id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    selected_options: { name?: string; choice?: string; extra_price?: number }[];
    special_note?: string | null;
    line_total: number;
  }[];
  created_at: string;
}

type MerchantTab = "new" | "cooking" | "ready";

const STATUS_TAB: Record<string, MerchantTab> = {
  paid:             "new",
  preparing:        "cooking",
  ready_for_pickup: "ready",
  rider_assigned:   "ready",
  picked_up:        "ready",
};

const TABS = [
  { id: "new"     as const, label: "รายการใหม่" },
  { id: "cooking" as const, label: "กำลังทำ" },
  { id: "ready"   as const, label: "พร้อมส่ง/ส่งแล้ว" },
];

function timeSince(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);      
  return mins;
}

function PrepTimeModal({ onSelect, onCancel }: { onBack: () => void, onSelect: (mins: number) => void, onCancel: () => void }) {
  const options = [10, 15, 20, 30, 45];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
      <div className="w-full bg-white rounded-t-[32px] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-bold text-text-primary mb-2 text-center">ใช้เวลาทำประมาณกี่นาทีคะ?</h3>
        <p className="text-sm text-text-secondary mb-8 text-center">ระบุเวลาเพื่อให้ลูกค้าทราบและเตรียมตัวรับอาหารค่ะ</p>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {options.map((mins) => (
            <button
              key={mins}
              onClick={() => onSelect(mins)}
              className="h-16 rounded-2xl border-2 border-border bg-surface-card flex items-center justify-center gap-3 text-lg font-bold text-text-primary active:border-brand-primary active:bg-brand-primary-light transition-all"
            >
              <Timer size={20} className="text-brand-primary" />
              {mins} นาที
            </button>
          ))}
        </div>

        <button 
          onClick={onCancel}
          className="w-full h-14 rounded-2xl bg-surface-bg text-text-secondary font-bold"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onOpen,
  onAccept,
  onReady,
  onReject,
  isUpdating,
}: {
  order: OrderListItem;
  onOpen: () => void;
  onAccept: (mins: number) => void;
  onReady: () => void;
  onReject: (reason: string) => void;
  isUpdating: boolean;
}) {
  const [showPrep, setShowPrep] = useState(false);
  const tab = STATUS_TAB[order.status] ?? "new";
  const mins = timeSince(order.created_at);
  
  return (
    <div className={cn(
      "bg-surface-card rounded-modal p-4 border-[1.5px] shadow-sm",
      tab === "new" ? "border-brand-primary animate-in fade-in zoom-in duration-300 ring-4 ring-brand-primary/5" : "border-border"
    )}>
      {showPrep && (
        <PrepTimeModal 
          onSelect={(m) => { setShowPrep(false); onAccept(m); }} 
          onCancel={() => setShowPrep(false)}
          onBack={() => setShowPrep(false)}
        />
      )}

      <button onClick={onOpen} className="w-full text-left">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-text-primary font-mono">#{order.order_number}</span>
          {tab === "new" && (
            <span className="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              NEW
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-brand-primary tabular-nums">฿{order.total}</span>
      </div>

      <div className="text-sm text-text-secondary mb-4 flex items-center justify-between">
        <span>{order.item_count} รายการ · {order.payment_method === "cod" ? "จ่ายปลายทาง" : "โอนแล้ว"}</span>
        <span className="text-xs text-text-tertiary flex items-center gap-1">
          <Clock size={12} /> {mins} นาทีที่แล้ว
        </span>
      </div>
      </button>

      <div className="flex gap-2">
        {tab === "new" ? (
          <>
            <button
              onClick={() => setShowPrep(true)}
              disabled={isUpdating}
              className="flex-1 h-11 rounded-card bg-brand-primary text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              รับออเดอร์
            </button>
            <button
              onClick={() => {
                const reason = window.prompt("ระบุเหตุผลที่ยกเลิก (เช่น ของหมด, ร้านยุ่งมาก)");
                if (reason) onReject(reason);
              }}
              disabled={isUpdating}
              className="w-12 h-11 rounded-card bg-status-danger-bg text-status-danger grid place-items-center active:scale-95 transition-transform disabled:opacity-50"
            >
              <XCircle size={20} />
            </button>
          </>
        ) : tab === "cooking" ? (
          <button
            onClick={onReady}
            disabled={isUpdating}
            className="w-full h-11 rounded-card bg-status-success text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : "ทำเสร็จแล้ว — แจ้งไรเดอร์"}
          </button>
        ) : (
          <div className="w-full py-2.5 text-center text-xs font-semibold text-text-tertiary bg-surface-bg rounded-lg border border-dashed border-border uppercase tracking-widest">
            {order.status === "ready_for_pickup" ? "รอไรเดอร์มารับ" : "ไรเดอร์รับของแล้ว"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MerchantOrdersPage() {
  const [tab, setTab] = useState<MerchantTab>("new");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-orders"],
    queryFn: () => api.getOrders() as Promise<ApiResponse<OrderListItem[]>>,    
  });
  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ["merchant-order-detail", selectedOrderId],
    queryFn: () => api.getOrder(selectedOrderId!) as Promise<ApiResponse<OrderDetail>>,
    enabled: !!selectedOrderId,
  });
  const orderDetail = detailRes?.data ?? null;

  const updateMutation = useMutation({
    mutationFn: ({ id, status, prepTime }: { id: string, status: string, prepTime?: number }) =>
      api.updateOrderStatus(id, { status, prep_time_mins: prepTime }),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-order-detail", variables.id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.cancelOrder(id, reason),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-order-detail", variables.id] });
      setSelectedOrderId(null);
    },
    onError: () => toast("ยกเลิกไม่สำเร็จ ลองใหม่อีกครั้ง"),
  });

  const all = (data?.data ?? []).filter((o) => o.status in STATUS_TAB);
  const counts = {
    new:     all.filter((o) => STATUS_TAB[o.status] === "new").length,      
    cooking: all.filter((o) => STATUS_TAB[o.status] === "cooking").length,        
    ready:   all.filter((o) => STATUS_TAB[o.status] === "ready").length,       
  };
  const filtered = all.filter((o) => STATUS_TAB[o.status] === tab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="ออเดอร์" sub={`มี ${counts.new} รายการใหม่`} />

      {/* Tabs */}
      <div className="p-3 pb-0 shrink-0">
        <div className="bg-surface-card p-1 rounded-[14px] border border-border flex gap-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 h-10 rounded-[10px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                tab === id 
                  ? "bg-text-primary text-white shadow-sm" 
                  : "text-text-secondary hover:text-text-primary active:bg-surface-bg"
              )}
            >
              {label}
              {counts[id] > 0 && (
                <span className={cn(
                  "min-w-[18px] h-4.5 px-1 rounded-full text-[10px] grid place-items-center",
                  tab === id ? "bg-white text-text-primary" : "bg-brand-primary text-white"
                )}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-3">
        {isLoading ? (
          [1, 2].map((n) => (
            <div key={n} className="bg-surface-card h-32 rounded-modal border border-border animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-card border border-border grid place-items-center text-3xl opacity-50">
              {tab === "new" ? "📥" : tab === "cooking" ? "👨‍🍳" : "✅"}
            </div>
            <div>
              <div className="text-base font-bold text-text-primary mb-1">
                {tab === "new" ? "ยังไม่มีออเดอร์ใหม่" : tab === "cooking" ? "ยังไม่มีออเดอร์ที่กำลังทำ" : "ยังไม่มีออเดอร์ที่พร้อมส่ง"}
              </div>
              <div className="text-sm text-text-secondary">รอลูกค้าสั่งอาหารเข้ามานะคะ</div>
            </div>
          </div>
        ) : (
          filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onOpen={() => setSelectedOrderId(o.id)}
              onAccept={(m) => updateMutation.mutate({ id: o.id, status: "preparing", prepTime: m })}
              onReady={() => updateMutation.mutate({ id: o.id, status: "ready_for_pickup" })}
              onReject={(reason) => cancelMutation.mutate({ id: o.id, reason })}
              isUpdating={(updateMutation.isPending && updateMutation.variables?.id === o.id) || 
                          (cancelMutation.isPending && cancelMutation.variables?.id === o.id)}
            />
          ))
        )}
      </div>

      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 animate-in fade-in duration-200">
          <div className="w-full max-h-[88dvh] bg-surface-bg rounded-t-[28px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="px-4 py-3 bg-surface-card border-b border-border flex items-center justify-between shrink-0">
              <div>
                <div className="text-lg font-bold text-text-primary">รายละเอียดออเดอร์</div>
                <div className="text-xs font-mono text-brand-primary">
                  {orderDetail?.order_number ? `#${orderDetail.order_number}` : "กำลังโหลด..."}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-10 h-10 rounded-full bg-surface-bg border border-border grid place-items-center text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-3">
              {detailLoading ? (
                <div className="py-16 flex flex-col items-center gap-2 text-text-secondary">
                  <Loader2 className="animate-spin text-brand-primary" size={28} />
                  <div className="text-sm">กำลังโหลดรายละเอียด...</div>
                </div>
              ) : orderDetail ? (
                <>
                  <div className="bg-surface-card rounded-card border border-border p-3.5">
                    <div className="flex items-center gap-2 mb-3 text-text-primary">
                      <ReceiptText size={18} className="text-brand-primary" />
                      <div className="text-sm font-bold">รายการอาหาร</div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {orderDetail.items.map((item) => (
                        <div key={item.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                          <div className="flex justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-text-primary">
                                <span className="text-brand-primary mr-1.5">{item.quantity}x</span>
                                {item.item_name}
                              </div>
                              {item.selected_options.length > 0 && (
                                <div className="mt-1 flex flex-col gap-0.5">
                                  {item.selected_options.map((opt, idx) => (
                                    <div key={idx} className="text-xs text-text-secondary">
                                      {opt.name ? `${opt.name}: ` : ""}
                                      {opt.choice ?? "-"}
                                      {opt.extra_price ? ` (+${formatPrice(opt.extra_price)})` : ""}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.special_note && (
                                <div className="mt-1.5 rounded-[8px] bg-brand-primary-light px-2 py-1 text-xs text-brand-primary">
                                  หมายเหตุ: {item.special_note}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-bold text-text-primary tabular-nums">
                              {formatPrice(item.line_total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-card rounded-card border border-border p-3.5">
                    <div className="flex items-center gap-2 mb-2 text-text-primary">
                      <MapPin size={18} className="text-brand-secondary" />
                      <div className="text-sm font-bold">ที่อยู่จัดส่ง</div>
                    </div>
                    <div className="text-sm text-text-primary leading-relaxed">{orderDetail.delivery_address}</div>
                    {orderDetail.delivery_note && (
                      <div className="mt-2 rounded-[8px] bg-surface-bg px-2.5 py-2 text-xs text-text-secondary">
                        หมายเหตุจัดส่ง: {orderDetail.delivery_note}
                      </div>
                    )}
                  </div>

                  <div className="bg-surface-card rounded-card border border-border p-3.5">
                    <div className="flex items-center gap-2 mb-2 text-text-primary">
                      <Wallet size={18} className="text-brand-primary" />
                      <div className="text-sm font-bold">สรุปยอด</div>
                    </div>
                    <div className="flex justify-between py-1 text-sm text-text-secondary">
                      <span>ค่าอาหาร</span>
                      <span className="tabular-nums">{formatPrice(orderDetail.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm text-text-secondary">
                      <span>ค่าจัดส่ง</span>
                      <span className="tabular-nums">{formatPrice(orderDetail.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm text-text-secondary">
                      <span>วิธีชำระเงิน</span>
                      <span>{orderDetail.payment_method === "cod" ? "จ่ายปลายทาง" : "PromptPay"}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-primary">รวมทั้งหมด</span>
                      <span className="text-xl font-extrabold text-brand-primary tabular-nums">
                        {formatPrice(orderDetail.total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-status-danger text-sm font-bold">
                  ไม่พบรายละเอียดออเดอร์
                </div>
              )}
            </div>

            {orderDetail && (
              <div className="p-4 bg-surface-card border-t border-border shrink-0">
                {orderDetail.status === "paid" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const reason = window.prompt("ระบุเหตุผลที่ยกเลิก (เช่น ของหมด, ร้านยุ่งมาก)");
                        if (reason) cancelMutation.mutate({ id: orderDetail.id, reason });
                      }}
                      disabled={cancelMutation.isPending || updateMutation.isPending}
                      className="w-12 h-12 rounded-card bg-status-danger-bg text-status-danger grid place-items-center disabled:opacity-60"
                    >
                      <XCircle size={22} />
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: orderDetail.id, status: "preparing", prepTime: 20 })}
                      disabled={cancelMutation.isPending || updateMutation.isPending}
                      className="flex-1 h-12 rounded-card bg-brand-primary text-white font-bold disabled:opacity-60"
                    >
                      รับออเดอร์ · 20 นาที
                    </button>
                  </div>
                ) : orderDetail.status === "preparing" ? (
                  <button
                    onClick={() => updateMutation.mutate({ id: orderDetail.id, status: "ready_for_pickup" })}
                    disabled={updateMutation.isPending}
                    className="w-full h-12 rounded-card bg-status-success text-white font-bold disabled:opacity-60"
                  >
                    ทำเสร็จแล้ว — แจ้งไรเดอร์
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="w-full h-12 rounded-card bg-surface-bg border border-border text-text-primary font-bold"
                  >
                    ปิดรายละเอียด
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
