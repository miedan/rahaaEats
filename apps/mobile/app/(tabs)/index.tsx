import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { CATEGORY_DISPLAY } from '../../constants/categories';
import { CategoryChip } from '../../components/CategoryChip';
import { FoodProductCard } from '../../components/FoodProductCard';
import { getProfile } from '../../services/profile.service';
import { getAddresses } from '../../services/address.service';
import { getCategories } from '../../services/category.service';
import { search } from '../../services/search.service';
import { useAddToCart } from '../../utils/useAddToCart';
import { SideDrawer } from '../../components/SideDrawer';

const MAIN_GRID_SIZE = 8;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const addToCart = useAddToCart();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const {
    data: topRatedResult,
    isLoading: isLoadingFoods,
    isError: isFoodsError,
  } = useQuery({
    queryKey: ['topRatedFoods'],
    queryFn: () => search({ type: 'foods', sort: 'rating', limit: 8 }),
  });

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const visibleCategories = categories?.slice(0, MAIN_GRID_SIZE) ?? [];
  const hasMoreCategories = (categories?.length ?? 0) > MAIN_GRID_SIZE;
  const topRatedFoods = topRatedResult?.foods ?? [];

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.xs }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.identity} onPress={() => setDrawerOpen(true)}>
            <View style={styles.avatar}>
              {profile?.profilePhotoUrl ? (
                <Image source={{ uri: profile.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={20} color={COLORS.iconLight} />
              )}
            </View>
            <View>
              <Text style={styles.deliveringTo}>
                Delivering to <Text style={styles.deliveringToBold}>{defaultAddress?.label ?? 'your address'}</Text>
              </Text>
              <Pressable style={styles.locationRow} onPress={() => router.push('/address/search')}>
                <Ionicons name="location" size={20} color={COLORS.iconDefault} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {defaultAddress?.formattedAddress ?? 'Add a delivery address'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.iconLight} />
              </Pressable>
            </View>
          </Pressable>

          <View style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.iconDefault} />
          </View>
        </View>

        <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="search" size={20} color={COLORS.iconDefault} />
          <Text style={styles.searchPlaceholder}>What do you want to eat today?</Text>
        </Pressable>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>35% OFF on Burgers!</Text>
          <Pressable style={styles.bannerButton} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.bannerButtonText}>Buy now</Text>
          </Pressable>
        </View>

        {isLoadingCategories ? (
          <ActivityIndicator style={styles.sectionLoading} color={COLORS.iconPrimary} />
        ) : visibleCategories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {chunk(visibleCategories, 4).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.categoryRow}>
                {row.map(({ category }) => (
                  <CategoryChip
                    key={category}
                    emoji={CATEGORY_DISPLAY[category].emoji}
                    label={CATEGORY_DISPLAY[category].label}
                    onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category } })}
                  />
                ))}
                {rowIndex === 1 && hasMoreCategories ? (
                  <Pressable style={styles.moreChip} onPress={() => setShowAllCategories(true)}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.iconDefault} />
                    <Text style={styles.moreChipLabel}>More</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highest Rated Items</Text>
          {isLoadingFoods ? (
            <ActivityIndicator style={styles.sectionLoading} color={COLORS.iconPrimary} />
          ) : isFoodsError ? (
            <Text style={styles.emptyText}>Couldn&apos;t load top items right now.</Text>
          ) : topRatedFoods.length === 0 ? (
            <Text style={styles.emptyText}>No rated items yet.</Text>
          ) : (
            <View style={styles.foodGrid}>
              {chunk(topRatedFoods, 2).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.foodRow}>
                  {row.map((food) => (
                    <FoodProductCard
                      key={food.id}
                      photoUrl={food.photoUrl}
                      name={food.name}
                      restaurantName={food.restaurantName}
                      priceRwf={food.priceRwf}
                      rating={food.avgRating}
                      onPress={() => router.push(`/food/${food.id}`)}
                      onAddPress={() =>
                        addToCart(
                          {
                            menuItemId: food.id,
                            name: food.name,
                            photoUrl: food.photoUrl,
                            priceRwf: food.priceRwf,
                            restaurantId: food.restaurantId,
                            restaurantName: food.restaurantName,
                          },
                          1
                        )
                      }
                    />
                  ))}
                  {row.length === 1 ? <View style={styles.foodCardSpacer} /> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showAllCategories} transparent animationType="slide" onRequestClose={() => setShowAllCategories(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowAllCategories(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
          <View style={styles.sheetBar} />
          <Text style={styles.sheetTitle}>Categories</Text>
          <Text style={styles.sheetSubtitle}>Browse all available food categories</Text>
          <View style={styles.categoryGrid}>
            {chunk(categories ?? [], 4).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.categoryRow}>
                {row.map(({ category }) => (
                  <CategoryChip
                    key={category}
                    emoji={CATEGORY_DISPLAY[category].emoji}
                    label={CATEGORY_DISPLAY[category].label}
                    onPress={() => {
                      setShowAllCategories(false);
                      router.push({ pathname: '/(tabs)/explore', params: { category } });
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </Modal>

      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={profile ?? null}
      />
    </View>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 40, height: 40 },
  deliveringTo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  deliveringToBold: {
    fontFamily: 'Poppins_700Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  locationText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.headingText,
    maxWidth: 180,
  },
  notificationBell: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.elementBackground,
  },
  searchPlaceholder: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.inactiveText,
  },
  banner: {
    height: 140,
    borderRadius: RADII.md,
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  bannerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.headingText,
    maxWidth: 180,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary600,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xxs,
  },
  bannerButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: COLORS.white,
  },
  categoryGrid: { gap: SPACING.xs },
  categoryRow: { flexDirection: 'row', gap: SPACING.xs },
  moreChip: {
    flex: 1,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
  },
  moreChipLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.headingText,
  },
  section: { gap: SPACING.sm },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.headingText,
  },
  sectionLoading: { marginVertical: SPACING.lg },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
  },
  foodGrid: { gap: SPACING.sm },
  foodRow: { flexDirection: 'row', gap: SPACING.sm },
  foodCardSpacer: { flex: 1 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: COLORS.elementBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    gap: SPACING.xs,
  },
  sheetBar: {
    width: 100,
    height: 4,
    borderRadius: 16,
    backgroundColor: COLORS.disabledBackground,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.lightGreyText,
  },
  sheetSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.paragraphText,
    marginBottom: SPACING.md,
  },
});
