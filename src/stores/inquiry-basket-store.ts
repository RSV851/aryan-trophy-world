'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface InquiryBasketItem {
  productId: string;
  name: string;
  sku: string;
  slug: string;
  primaryImage?: string | null;
  typeName?: string | null;
  categoryName?: string | null;
  sizeUnit?: string | null;
  priceRange?: string | null;
  quantity: number;
}

interface InquiryBasketState {
  items: InquiryBasketItem[];
  addItem: (item: Omit<InquiryBasketItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  getTotalCount: () => number;
}

export const useInquiryBasketStore = create<InquiryBasketState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem, qty = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.productId === newItem.productId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += qty;
          set({ items: updated });
        } else {
          set({ items: [...currentItems, { ...newItem, quantity: qty }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },

      clearBasket: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'aryan_inquiry_basket',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
