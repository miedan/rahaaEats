import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { FoodProductCard } from '../../components/FoodProductCard';
import { getRestaurant } from '../../services/restaurant.service';
import { getRestaurantRatings } from '../../services/rating.service';
import { useAddToCart } from '../../utils/useAddToCart';

type DetailTab = 'menu' | 'reviews';

export default function RestaurantDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useAddToCart();
  const [tab, setTab] = useState<DetailTab>('menu');

  const { data: restaurant, isLoading, isError } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurant(id),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['restaurantRatings', id],
    queryFn: () => getRestaurantRatings(id),
    enabled: !!id,
  });

  async function handleSharePress() {
    if (!restaurant) return;
    await Share.share({ message: `Check out ${restaurant.businessName} on Rahaa Eats!` });
  }

  function handleWriteReview() {
    Alert.alert(
      'Order it first',
      'You can rate this restaurant after your order has been delivered.'
    );
  }

  function handleSearchPress() {
    if (!restaurant) return;
    router.push({
      pathname: '/(tabs)/explore',
      params: { restaurantId: restaurant.id, restaurantName: restaurant.businessName },
    });
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  if (isError || !restaurant) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>Couldn&apos;t load this restaurant.</Text>
      </View>
    );
  }

  const items = restaurant.menuSections.flatMap((section) => section.items);

  return (
    <View style={styles.flex}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrap}>
          {restaurant.coverPhotoUrl ? (
            <Image source={{ uri: restaurant.coverPhotoUrl }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="storefront-outline" size={48} color={COLORS.iconLight} />
            </View>
          )}
        </View>

        <View style={[styles.headerRow, { top: insets.top + SPACING.xs }]}>
          <Pressable style={styles.iconButton} onPress={() => router.canGoBack() && router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.headingText} />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton} onPress={handleSearchPress}>
              <Ionicons name="search" size={20} color={COLORS.iconDefault} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleSharePress}>
              <Ionicons name="share-outline" size={22} color={COLORS.iconDefault} />
            </Pressable>
            <View style={styles.iconButton}>
              <Ionicons name="heart-outline" size={22} color={COLORS.iconDefault} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <View style={styles.logoWrap}>
              {restaurant.logoUrl ? (
                <Image source={{ uri: restaurant.logoUrl }} style={styles.logoImage} contentFit="cover" />
              ) : (
                <Ionicons name="storefront-outline" size={24} color={COLORS.iconLight} />
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.businessName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={COLORS.ratingAmber} />
              <Text style={styles.ratingValue}>{restaurant.avgRating.toFixed(1)}</Text>
              {reviews ? <Text style={styles.ratingCount}>({reviews.total} Ratings)</Text> : null}
            </View>
            <View style={[styles.statusPill, !restaurant.isOpen && styles.statusPillClosed]}>
              <Text style={[styles.statusPillLabel, !restaurant.isOpen && styles.statusPillLabelClosed]}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          {restaurant.addressDetails || restaurant.distanceM !== undefined ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.lightGreyText} />
              <Text style={styles.locationText} numberOfLines={1}>
                {[
                  restaurant.addressDetails,
                  restaurant.distanceM !== undefined
                    ? `${(restaurant.distanceM / 1000).toFixed(1)} km`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </Text>
            </View>
          ) : null}

          <View style={styles.tabsRow}>
            <Pressable style={styles.tabItem} onPress={() => setTab('menu')}>
              <Text style={[styles.tabLabel, tab === 'menu' && styles.tabLabelActive]}>Menu</Text>
              <View style={[styles.tabUnderline, tab === 'menu' && styles.tabUnderlineActive]} />
            </Pressable>
            <Pressable style={styles.tabItem} onPress={() => setTab('reviews')}>
              <Text style={[styles.tabLabel, tab === 'reviews' && styles.tabLabelActive]}>Reviews</Text>
              <View style={[styles.tabUnderline, tab === 'reviews' && styles.tabUnderlineActive]} />
            </Pressable>
          </View>

          {tab === 'menu' ? (
            items.length === 0 ? (
              <Text style={styles.emptyText}>No menu items yet.</Text>
            ) : (
              <View style={styles.menuGrid}>
                {chunk(items, 2).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.menuRow}>
                    {row.map((item) => (
                      <FoodProductCard
                        key={item.id}
                        photoUrl={item.photoUrl}
                        name={item.name}
                        restaurantName={restaurant.businessName}
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
                              restaurantId: restaurant.id,
                              restaurantName: restaurant.businessName,
                            },
                            1
                          )
                        }
                      />
                    ))}
                    {row.length === 1 ? <View style={styles.menuCardSpacer} /> : null}
                  </View>
                ))}
              </View>
            )
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall reviews</Text>
              {reviews ? (
                <>
                  <View style={styles.reviewSummaryCard}>
                    <View style={styles.reviewSummaryLeft}>
                      <View style={styles.reviewScoreRow}>
                        <Text style={styles.reviewScore}>{reviews.avgRating.toFixed(1)}</Text>
                        <Text style={styles.reviewScoreMax}>/5</Text>
                      </View>
                      <Text style={styles.reviewBasedOn}>Based on {reviews.total} Reviews</Text>
                    </View>
                    <View style={styles.breakdownList}>
                      {reviews.breakdown
                        .slice()
                        .reverse()
                        .map((row) => (
                          <View key={row.stars} style={styles.breakdownRow}>
                            <Text style={styles.breakdownStars}>{row.stars}</Text>
                            <View style={styles.breakdownTrack}>
                              <View
                                style={[
                                  styles.breakdownFill,
                                  {
                                    width:
                                      reviews.total > 0
                                        ? `${(row.count / reviews.total) * 100}%`
                                        : '0%',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        ))}
                    </View>
                  </View>

                  <Pressable style={styles.writeReviewButton} onPress={handleWriteReview}>
                    <Ionicons name="pencil-outline" size={18} color={COLORS.primary600} />
                    <Text style={styles.writeReviewLabel}>Write a review</Text>
                  </Pressable>

                  {reviews.reviews.length === 0 ? (
                    <Text style={styles.emptyText}>No reviews yet.</Text>
                  ) : (
                    reviews.reviews.map((review) => (
                      <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewAvatar}>
                            {review.customerPhotoUrl ? (
                              <Image
                                source={{ uri: review.customerPhotoUrl }}
                                style={styles.reviewAvatarImage}
                                contentFit="cover"
                              />
                            ) : (
                              <Ionicons name="person" size={20} color={COLORS.iconLight} />
                            )}
                          </View>
                          <View style={styles.reviewHeaderText}>
                            <Text style={styles.reviewerName}>{review.customerName ?? 'Anonymous'}</Text>
                            <Text style={styles.reviewDate}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name="star"
                              size={16}
                              color={star <= review.rating ? COLORS.ratingAmber : COLORS.borderDefault}
                            />
                          ))}
                        </View>
                        {review.comment ? (
                          <Text style={styles.reviewComment}>{review.comment}</Text>
                        ) : null}
                      </View>
                    ))
                  )}
                </>
              ) : (
                <ActivityIndicator color={COLORS.iconPrimary} />
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  photoWrap: { width: '100%', height: 220 },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerRight: { flexDirection: 'row', gap: SPACING.xxs },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.transparentNav,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    backgroundColor: COLORS.elementBackground,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: 56, height: 56 },
  name: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.headingText,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingValue: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.headingText },
  ratingCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  statusPill: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADII.xxl,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  statusPillClosed: { backgroundColor: COLORS.lightRedBackground },
  statusPillLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.headingText,
  },
  statusPillLabelClosed: { color: COLORS.dangerText },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs },
  locationText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.layer2Background,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: SPACING.xxs },
  tabLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.lightGreyText, paddingBottom: SPACING.xxs },
  tabLabelActive: { fontFamily: 'Poppins_600SemiBold', color: COLORS.headingText },
  tabUnderline: { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: COLORS.primary600 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText },
  menuGrid: { gap: SPACING.sm },
  menuRow: { flexDirection: 'row', gap: SPACING.sm },
  menuCardSpacer: { flex: 1 },
  section: { gap: SPACING.sm },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.headingText },
  reviewSummaryCard: {
    flexDirection: 'row',
    gap: SPACING.lg,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.md,
    padding: SPACING.lg,
  },
  reviewSummaryLeft: { gap: SPACING.xs },
  reviewScoreRow: { flexDirection: 'row', alignItems: 'flex-end' },
  reviewScore: { fontFamily: 'Poppins_700Bold', fontSize: 32, color: COLORS.headingText },
  reviewScoreMax: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.lightGreyText },
  reviewBasedOn: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText, width: 90 },
  breakdownList: { flex: 1, gap: SPACING.sm, justifyContent: 'center' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  breakdownStars: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText, width: 8 },
  breakdownTrack: { flex: 1, height: 6, borderRadius: 109, backgroundColor: COLORS.borderDefault },
  breakdownFill: { height: 6, borderRadius: 109, backgroundColor: '#F5AE42' },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADII.sm,
  },
  writeReviewLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.primary600 },
  reviewCard: { gap: SPACING.xs },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reviewAvatarImage: { width: 40, height: 40 },
  reviewHeaderText: { gap: 2 },
  reviewerName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: COLORS.headingText },
  reviewDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.lightGreyText },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText, lineHeight: 18 },
});
