import { create } from 'zustand';

export interface CartItem {
  menuItemId: string;
  name: string;
  photoUrl: string | null;
  priceRwf: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export type AddItemResult =
  | { status: 'added' }
  | { status: 'restaurant_conflict'; currentRestaurantName: string };

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => AddItemResult;
  replaceCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, quantity) => {
    const state = get();
    const currentRestaurantId = state.items[0]?.restaurantId;

    if (currentRestaurantId && currentRestaurantId !== item.restaurantId) {
      return { status: 'restaurant_conflict', currentRestaurantName: state.items[0].restaurantName };
    }

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
    return { status: 'added' };
  },
  replaceCart: (item, quantity) => set({ items: [{ ...item, quantity }] }),
  removeItem: (menuItemId) =>
    set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
  setQuantity: (menuItemId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.menuItemId !== menuItemId)
        : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
    })),
  clear: () => set({ items: [] }),
}));
