"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wsClient } from "@/lib/websocket";
import { useNotificationStore } from "@/stores/notification";

const ORDER_STATUS_COPY: Record<string, { title: string; message: string }> = {
  pending_payment: {
    title: "รอชำระเงิน",
    message: "กรุณาชำระเงินเพื่อให้ร้านเริ่มรับออเดอร์ค่ะ",
  },
  paid: {
    title: "ร้านได้รับออเดอร์แล้ว",
    message: "ร้านได้รับคำสั่งซื้อแล้ว กำลังรอเริ่มทำอาหารค่ะ",
  },
  preparing: {
    title: "ร้านกำลังทำอาหาร",
    message: "ร้านเริ่มเตรียมอาหารให้คุณแล้วค่ะ",
  },
  ready_for_pickup: {
    title: "อาหารพร้อมรับแล้ว",
    message: "อาหารทำเสร็จแล้ว กำลังรอไรเดอร์ไปรับค่ะ",
  },
  rider_assigned: {
    title: "ไรเดอร์รับงานแล้ว",
    message: "ไรเดอร์กำลังไปรับอาหารที่ร้านค่ะ",
  },
  picked_up: {
    title: "ไรเดอร์รับอาหารแล้ว",
    message: "ไรเดอร์กำลังนำอาหารไปส่งให้คุณค่ะ",
  },
  delivered: {
    title: "ส่งสำเร็จแล้ว",
    message: "ออเดอร์นี้ส่งถึงปลายทางเรียบร้อยแล้วค่ะ",
  },
  cancelled: {
    title: "ออเดอร์ถูกยกเลิก",
    message: "ออเดอร์นี้ถูกยกเลิกแล้วค่ะ",
  },
  refunded: {
    title: "คืนเงินแล้ว",
    message: "ระบบบันทึกการคืนเงินของออเดอร์นี้แล้วค่ะ",
  },
};

export function RealtimeHandler() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    if (!wsClient) return;

    // Connect using httpOnly cookies (token not needed in JS)
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((event) => {
      console.log("[Realtime Event]", event);
      
      switch (event.type) {
        case "NEW_ORDER":
          queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
          queryClient.invalidateQueries({ queryKey: ["merchant-dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          showNotification({
            type: "NEW_ORDER",
            title: "มีออเดอร์ใหม่!",
            message: "มีลูกค้าสั่งอาหารเข้ามาใหม่ค่ะ",
            data: event
          });
          break;
        case "ORDER_UPDATED":
          queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
          queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
          queryClient.invalidateQueries({ queryKey: ["order", event.order_id] });
          queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-order-detail", event.order_id] });
          
          // Only show notification for status changes (not minor updates)
          if (event.status) {
            const status = typeof event.status === "string" ? event.status : "";
            const copy = ORDER_STATUS_COPY[status] ?? {
              title: "อัปเดตออเดอร์",
              message: "สถานะออเดอร์มีการเปลี่ยนแปลงค่ะ",
            };
            showNotification({
              type: "ORDER_STATUS",
              title: copy.title,
              message: copy.message,
              data: event
            });
          }
          break;
        case "ORDER_AVAILABLE":
          queryClient.invalidateQueries({ queryKey: ["rider-active-jobs"] });
          showNotification({
            type: "SYSTEM",
            title: "มีงานพร้อมรับ",
            message: "อาหารพร้อมแล้ว แตะเพื่อดูงานที่รอรับค่ะ",
            data: event
          });
          break;
        case "RIDER_LOCATION_UPDATED":
          // Update the order details for customers who are tracking this rider
          queryClient.invalidateQueries({ queryKey: ["order"] });
          break;
        case "SHOP_APPROVED":
          queryClient.invalidateQueries({ queryKey: ["my-shop"] });
          showNotification({
            type: "SYSTEM",
            title: "ร้านค้าได้รับอนุมัติ!",
            message: "ร้านค้าของคุณได้รับการอนุมัติแล้ว เริ่มเปิดร้านได้เลยค่ะ",
          });
          break;
        case "SHOP_SUSPENDED":
          queryClient.invalidateQueries({ queryKey: ["my-shop"] });
          showNotification({
            type: "SYSTEM",
            title: "ร้านค้าถูกระงับ",
            message: "กรุณาติดต่อแอดมินเพื่อตรวจสอบข้อมูลเพิ่มเติม",
          });
          break;
        case "RIDER_APPROVED":
          queryClient.invalidateQueries({ queryKey: ["rider-earnings"] });
          showNotification({
            type: "SYSTEM",
            title: "ไรเดอร์ได้รับอนุมัติ!",
            message: "คุณได้รับการอนุมัติแล้ว เริ่มรับงานได้เลยค่ะ",
          });
          break;
        case "SHOP_STATUS_CHANGED":
          queryClient.invalidateQueries({ queryKey: ["shops"] });
          queryClient.invalidateQueries({ queryKey: ["shop", event.shop_id] });
          queryClient.invalidateQueries({ queryKey: ["my-shop"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          break;
        case "RIDER_STATUS_CHANGED":
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
          break;
        case "SHOP_CREATED":
        case "SHOP_UPDATED":
          queryClient.invalidateQueries({ queryKey: ["shops"] });
          queryClient.invalidateQueries({ queryKey: ["shop", event.shop_id] });
          queryClient.invalidateQueries({ queryKey: ["my-shop"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          break;
        case "MENU_UPDATED":
          queryClient.invalidateQueries({ queryKey: ["menu", event.shop_id] });
          queryClient.invalidateQueries({ queryKey: ["menu-item", event.item_id] });
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, showNotification]);

  return null; // This component doesn't render anything
}
