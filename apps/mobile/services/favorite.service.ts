import type { FoodSearchResult } from '@rahaa/shared';
import { apiRequest } from './api';

export function getFavorites() {
  return apiRequest<FoodSearchResult[]>('/favorites', { auth: true });
}

export function addFavorite(menuItemId: string) {
  return apiRequest<{ menuItemId: string; isFavorite: boolean }>('/favorites', {
    method: 'POST',
    body: { menuItemId },
    auth: true,
  });
}

export function removeFavorite(menuItemId: string) {
  return apiRequest<{ menuItemId: string; isFavorite: boolean }>(`/favorites/${menuItemId}`, {
    method: 'DELETE',
    auth: true,
  });
}
