import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string, color: string) => void;
  updateQuantity: (sku: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.sku === item.sku && i.color === item.color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === item.sku && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (sku, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.sku === sku && i.color === color)
          ),
        }));
      },

      updateQuantity: (sku, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku && i.color === color ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "assey-cart",
    }
  )
);
