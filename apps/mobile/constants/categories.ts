import type { FoodCategory } from '@rahaa/shared';

export const CATEGORY_DISPLAY: Record<FoodCategory, { label: string; emoji: string }> = {
  BURGER: { label: 'Burger', emoji: '🍔' },
  BEEF: { label: 'Beef', emoji: '🥩' },
  DESSERT: { label: 'Dessert', emoji: '🍰' },
  JUICE: { label: 'Juice', emoji: '🧃' },
  NOODLES: { label: 'Noodles', emoji: '🍜' },
  PIZZA: { label: 'Pizza', emoji: '🍕' },
  SALAD: { label: 'Salad', emoji: '🥗' },
  OTHER: { label: 'Other', emoji: '🍽️' },
};
