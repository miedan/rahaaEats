import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  menuItemId: string;
  name: string;
  photoUrl: string | null;
  priceRwf: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  replaceCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity) => {
        set((s) => {
          const existing = s.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity }] };
        });
      },
      replaceCart: (item, quantity) => set({ items: [{ ...item, quantity }] }),
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'rahaa-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
