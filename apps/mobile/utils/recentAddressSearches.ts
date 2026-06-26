import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlaceAutocompleteResult } from '@rahaa/shared';

const RECENT_SEARCHES_KEY = 'rahaa_recent_address_searches';
const MAX_RECENT = 4;

export async function getRecentAddressSearches(): Promise<PlaceAutocompleteResult[]> {
  const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRecentAddressSearch(result: PlaceAutocompleteResult): Promise<void> {
  const existing = await getRecentAddressSearches();
  const deduped = [result, ...existing.filter((item) => item.placeId !== result.placeId)];
  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped.slice(0, MAX_RECENT)));
}
