import { Alert } from 'react-native';
import { useCartStore, CartItem } from '../store/cartStore';

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);
  const replaceCart = useCartStore((state) => state.replaceCart);

  return function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number) {
    const result = addItem(item, quantity);
    if (result.status === 'restaurant_conflict') {
      Alert.alert(
        'Start a new cart?',
        `Your cart has items from ${result.currentRestaurantName}. Adding this will clear your current cart.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start new cart', style: 'destructive', onPress: () => replaceCart(item, quantity) },
        ]
      );
    }
  };
}
