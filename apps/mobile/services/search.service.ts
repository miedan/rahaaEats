import type { FoodCategory, SearchResponse } from '@rahaa/shared';
import { apiRequest } from './api';

interface SearchParams {
  q?: string;
  type?: 'all' | 'foods' | 'restaurants';
  lat?: number;
  lng?: number;
  sort?: 'rating';
  limit?: number;
  category?: FoodCategory;
  restaurantId?: string;
}

export function search(params: SearchParams) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.type) query.set('type', params.type);
  if (params.lat !== undefined) query.set('lat', String(params.lat));
  if (params.lng !== undefined) query.set('lng', String(params.lng));
  if (params.sort) query.set('sort', params.sort);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.category) query.set('category', params.category);
  if (params.restaurantId) query.set('restaurantId', params.restaurantId);
  return apiRequest<SearchResponse>(`/search?${query}`);
}
