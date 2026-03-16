import { create } from "zustand";

interface CartToastItem {
  name: string;
  price: number;
  image: string;
}

interface CartToastState {
  isOpen: boolean;
  item: CartToastItem | null;
  showToast: (item: CartToastItem) => void;
  hideToast: () => void;
}

export const useCartToastStore = create<CartToastState>((set) => ({
  isOpen: false,
  item: null,
  showToast: (item) => {
    set({ isOpen: true, item });
  },
  hideToast: () => set({ isOpen: false }),
}));

