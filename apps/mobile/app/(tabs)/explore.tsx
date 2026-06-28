import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FoodCategory } from '@rahaa/shared';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { CATEGORY_DISPLAY } from '../../constants/categories';
import { SearchFoodRow } from '../../components/SearchFoodRow';
import { SearchRestaurantRow } from '../../components/SearchRestaurantRow';
import { search } from '../../services/search.service';
import { useAddToCart } from '../../utils/useAddToCart';
import { getRecentFoodSearches, addRecentFoodSearch } from '../../utils/recentFoodSearches';

type ResultTab = 'foods' | 'restaurants';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const addToCart = useAddToCart();
  const params = useLocalSearchParams<{
    category?: FoodCategory;
    restaurantId?: string;
    restaurantName?: string;
  }>();
  const scopedToRestaurant = !!params.restaurantId;

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [tab, setTab] = useState<ResultTab>('foods');
  const [recent, setRecent] = useState<string[]>([]);
  const [category, setCategory] = useState<FoodCategory | undefined>(params.category);

  useEffect(() => {
    getRecentFoodSearches().then(setRecent);
  }, []);

  useEffect(() => {
    if (params.category) {
      setCategory(params.category);
      setQuery(CATEGORY_DISPLAY[params.category].label);
    }
  }, [params.category]);

  const trimmedQuery = query.trim();

  const { data, isLoading } = useQuery({
    queryKey: ['search', trimmedQuery, tab, category, params.restaurantId],
    queryFn: () =>
      search({
        q: category ? undefined : trimmedQuery,
        category,
        type: scopedToRestaurant ? 'foods' : tab,
        restaurantId: params.restaurantId,
        sort: 'rating',
        limit: 20,
      }),
    enabled: (scopedToRestaurant && trimmedQuery.length > 0) || (!scopedToRestaurant && (trimmedQuery.length > 0 || !!category)),
  });

  function runSearch(value: string) {
    setQuery(value);
    setCategory(undefined);
    setIsFocused(false);
    if (value.trim()) {
      addRecentFoodSearch(value.trim()).then(() => getRecentFoodSearches().then(setRecent));
    }
  }

  function clearSearch() {
    setQuery('');
    setCategory(undefined);
  }

  const showResults = (scopedToRestaurant && trimmedQuery.length > 0) || (!scopedToRestaurant && (trimmedQuery.length > 0 || !!category));
  const foods = data?.foods ?? [];
  const restaurants = data?.restaurants ?? [];

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={COLORS.headingText} />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              setCategory(undefined);
            }}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={() => runSearch(query)}
            placeholder={scopedToRestaurant ? `Search in "${params.restaurantName}"` : 'Search'}
            placeholderTextColor={COLORS.inactiveText}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={COLORS.inactiveText} />
            </Pressable>
          )}
        </View>
      </View>

      {showResults ? (
        <>
          {!scopedToRestaurant && (
            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tab, tab === 'foods' && styles.tabActive]}
                onPress={() => setTab('foods')}
              >
                <Text style={[styles.tabLabel, tab === 'foods' && styles.tabLabelActive]}>Foods</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === 'restaurants' && styles.tabActive]}
                onPress={() => setTab('restaurants')}
              >
                <Text style={[styles.tabLabel, tab === 'restaurants' && styles.tabLabelActive]}>
                  Restaurants
                </Text>
              </Pressable>
            </View>
          )}

          {isLoading ? (
            <ActivityIndicator style={styles.loading} color={COLORS.iconPrimary} />
          ) : scopedToRestaurant || tab === 'foods' ? (
            <FlatList
              data={foods}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No foods found</Text>}
              renderItem={({ item }) => (
                <SearchFoodRow
                  photoUrl={item.photoUrl}
                  name={item.name}
                  restaurantName={item.restaurantName}
                  priceRwf={item.priceRwf}
                  rating={item.avgRating}
                  onPress={() => router.push(`/food/${item.id}`)}
                  onAddPress={() =>
                    addToCart(
                      {
                        menuItemId: item.id,
                        name: item.name,
                        photoUrl: item.photoUrl,
                        priceRwf: item.priceRwf,
                        restaurantId: item.restaurantId,
                        restaurantName: item.restaurantName,
                      },
                      1
                    )
                  }
                />
              )}
            />
          ) : (
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No restaurants found</Text>}
              renderItem={({ item }) => (
                <SearchRestaurantRow
                  logoUrl={item.logoUrl}
                  businessName={item.businessName}
                  distanceM={item.distanceM}
                  rating={item.avgRating}
                  onPress={() => router.push(`/restaurant/${item.id}`)}
                />
              )}
            />
          )}
        </>
      ) : (
        <View style={styles.recentWrap}>
          {scopedToRestaurant ? (
            recent.length === 0 ? (
              <Text style={styles.emptyText}>Search for food in this restaurant</Text>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Trending</Text>
                {recent.map((item) => (
                  <Pressable key={item} style={styles.recentRow} onPress={() => runSearch(item)}>
                    <Ionicons name="trending-up-outline" size={20} color={COLORS.lightGreyText} />
                    <Text style={styles.recentText}>{item}</Text>
                  </Pressable>
                ))}
              </>
            )
          ) : recent.length === 0 ? (
            <Text style={styles.emptyText}>No recent searches yet</Text>
          ) : (
            recent.map((item) => (
              <Pressable key={item} style={styles.recentRow} onPress={() => runSearch(item)}>
                <Ionicons name="time-outline" size={20} color={COLORS.lightGreyText} />
                <Text style={styles.recentText}>{item}</Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xs },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.elementBackground,
  },
  searchBarFocused: { borderColor: COLORS.borderPrimary },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  tabsRow: { flexDirection: 'row', gap: SPACING.xxs, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs },
  tab: {
    height: 34,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: COLORS.secondaryBackground, borderColor: COLORS.secondaryBackground },
  tabLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.lightGreyText },
  tabLabelActive: { fontFamily: 'Poppins_600SemiBold', color: COLORS.headingText },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  separator: { height: SPACING.xs },
  loading: { marginTop: SPACING.xxl },
  emptyText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
  },
  recentWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.headingText,
    marginBottom: SPACING.xxs,
    paddingHorizontal: SPACING.md,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    paddingHorizontal: SPACING.md,
  },
  recentText: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.headingText },
});
