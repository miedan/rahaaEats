import type {
  PlaceAutocompleteResult,
  PlaceDetailsResult,
  ReverseGeocodeResult,
} from '@rahaa/shared';
import { apiRequest } from './api';

export function autocompletePlaces(q: string, lat?: number, lng?: number) {
  const params = new URLSearchParams({ q });
  if (lat !== undefined && lng !== undefined) {
    params.set('lat', String(lat));
    params.set('lng', String(lng));
  }
  return apiRequest<PlaceAutocompleteResult[]>(`/places/autocomplete?${params}`, { auth: true });
}

export function getPlaceDetails(placeId: string) {
  const params = new URLSearchParams({ placeId });
  return apiRequest<PlaceDetailsResult>(`/places/details?${params}`, { auth: true });
}

export function reverseGeocode(lat: number, lng: number) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  return apiRequest<ReverseGeocodeResult>(`/places/reverse-geocode?${params}`, { auth: true });
}
