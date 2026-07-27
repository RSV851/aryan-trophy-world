import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

export interface InquiryItem {
  productId: string;
  slug?: string;
  name: string;
  sku: string;
  imageUrl?: string;
  priceRange?: string;
  quantity: number;
  sizeUnit?: string;
  selectedSizeLabel?: string;
  categoryName?: string;
}

interface InquiryState {
  items: InquiryItem[];
  addItem: (item: Omit<InquiryItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearInquiry: () => void;
  getTotalItems: () => number;
  isInInquiry: (productId: string) => boolean;
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.productId === newItem.productId);
        const quantityToAdd = newItem.quantity || 25; // Default wholesale starting threshold

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += quantityToAdd;
          if (newItem.selectedSizeLabel) {
            updated[existingIndex].selectedSizeLabel = newItem.selectedSizeLabel;
          }
          set({ items: updated });
          toast.success(`Updated quantity for "${newItem.name}" in Inquiry Basket`);
        } else {
          set({ items: [...items, { ...newItem, quantity: quantityToAdd }] });
          toast.success(`Added "${newItem.name}" to Wholesale Inquiry Basket`);
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const filtered = items.filter((i) => i.productId !== productId);
        set({ items: filtered });
        toast.info('Item removed from Inquiry Basket');
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const { items } = get();
        const updated = items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        set({ items: updated });
      },

      clearInquiry: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.length;
      },

      isInInquiry: (productId) => {
        const { items } = get();
        return items.some((i) => i.productId === productId);
      },
    }),
    {
      name: 'aryan-trophy-world-inquiry-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
