import type { RestaurantDetail } from '@rahaa/shared';
import { apiRequest } from './api';

export function getRestaurant(id: string, lat?: number, lng?: number) {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set('lat', String(lat));
  if (lng !== undefined) params.set('lng', String(lng));
  const query = params.toString();
  return apiRequest<RestaurantDetail>(`/restaurants/${id}${query ? `?${query}` : ''}`);
}
