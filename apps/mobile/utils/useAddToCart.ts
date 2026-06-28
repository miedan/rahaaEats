import { useCartStore, CartItem } from '../store/cartStore';

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);

  return function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number) {
    addItem(item, quantity);
  };
}
