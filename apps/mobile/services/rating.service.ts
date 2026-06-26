import type { FoodRating, FoodReviewSummary, RestaurantRating, RestaurantReviewSummary } from '@rahaa/shared';
import { apiRequest } from './api';

export function getFoodRatings(menuItemId: string) {
  return apiRequest<FoodReviewSummary>(`/ratings/food?menuItemId=${menuItemId}`);
}

interface CreateFoodRatingPayload {
  orderId: string;
  menuItemId: string;
  rating: number;
  comment?: string;
  photoUrl?: string;
}

export function createFoodRating(payload: CreateFoodRatingPayload) {
  return apiRequest<FoodRating>('/ratings/food', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getRestaurantRatings(restaurantId: string) {
  return apiRequest<RestaurantReviewSummary>(`/ratings/restaurant?restaurantId=${restaurantId}`);
}

interface CreateRestaurantRatingPayload {
  orderId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
}

export function createRestaurantRating(payload: CreateRestaurantRatingPayload) {
  return apiRequest<RestaurantRating>('/ratings/restaurant', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}
