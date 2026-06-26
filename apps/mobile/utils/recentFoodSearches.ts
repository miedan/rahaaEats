import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'rahaa_recent_food_searches';
const MAX_RECENT = 6;

export async function getRecentFoodSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRecentFoodSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = await getRecentFoodSearches();
  const deduped = [trimmed, ...existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())];
  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped.slice(0, MAX_RECENT)));
}
