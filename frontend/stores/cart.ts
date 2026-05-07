import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuItem, SelectedOption } from "@/types";

interface CartState {
  items: CartItem[];
  shopId: string | null;
  shopName: string | null;

  // Actions
  addItem: (item: MenuItem, quantity: number, options: SelectedOption[], note?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setShop: (shopId: string, shopName: string) => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

function calcLineTotal(item: MenuItem, quantity: number, options: SelectedOption[]): number {
  const extras = options.reduce((sum, opt) => sum + opt.extra_price, 0);
  return (item.price + extras) * quantity;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      shopName: null,

      addItem: (item, quantity, options, note) => {
        const state = get();
        // ถ้าสั่งร้านใหม่ → ล้างตะกร้าก่อน
        if (state.shopId && state.shopId !== item.shop_id) {
          set({ items: [], shopId: item.shop_id });
        }

        const existing = state.items.find((i) => i.menu_item_id === item.id);
        if (existing) {
          // Update quantity
          set({
            items: state.items.map((i) =>
              i.menu_item_id === item.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    line_total: calcLineTotal(item, i.quantity + quantity, options),
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...state.items,
              {
                menu_item_id: item.id,
                menu_item: item,
                quantity,
                selected_options: options,
                special_note: note,
                line_total: calcLineTotal(item, quantity, options),
              },
            ],
            shopId: item.shop_id,
          });
        }
      },

      removeItem: (menuItemId) => {
        const newItems = get().items.filter((i) => i.menu_item_id !== menuItemId);
        set({
          items: newItems,
          shopId: newItems.length === 0 ? null : get().shopId,
          shopName: newItems.length === 0 ? null : get().shopName,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menu_item_id === menuItemId
              ? {
                  ...i,
                  quantity,
                  line_total: calcLineTotal(i.menu_item, quantity, i.selected_options),
                }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], shopId: null, shopName: null }),

      setShop: (shopId, shopName) => set({ shopId, shopName }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.line_total, 0),
    }),
    {
      name: "cart-storage",
      version: 1,
    }
  )
);
