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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FoodProductCard } from '../../components/FoodProductCard';
import { getMenuItem } from '../../services/menuItem.service';
import { getFoodRatings } from '../../services/rating.service';
import { getFavorites, addFavorite, removeFavorite } from '../../services/favorite.service';
import { useAddToCart } from '../../utils/useAddToCart';

type DetailTab = 'details' | 'reviews';

export default function FoodDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<DetailTab>('details');
  const [quantity, setQuantity] = useState(1);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['menuItem', id],
    queryFn: () => getMenuItem(id),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['foodRatings', id],
    queryFn: () => getFoodRatings(id),
    enabled: !!id,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  const favorite = favorites?.some((f) => f.id === id) ?? false;

  async function handleFavoritePress() {
    if (favorite) {
      await removeFavorite(id);
    } else {
      await addFavorite(id);
    }
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  }

  async function handleSharePress() {
    if (!item) return;
    await Share.share({ message: `Check out ${item.name} on Rahaa Eats!` });
  }

  function handleWriteReview() {
    Alert.alert(
      'Order it first',
      'You can rate and review this item after your order has been delivered.'
    );
  }

  function handleAddToCart() {
    if (!item) return;
    addToCart(
      {
        menuItemId: item.id,
        name: item.name,
        photoUrl: item.photoUrl,
        priceRwf: item.priceRwf,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      },
      quantity
    );
    router.push('/(tabs)/cart');
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  if (isError || !item) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>Couldn&apos;t load this item.</Text>
      </View>
    );
  }

  const ingredients = item.ingredients
    ? item.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <View style={styles.flex}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrap}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.iconLight} />
            </View>
          )}
        </View>

        <View style={[styles.headerRow, { top: insets.top + SPACING.xs }]}>
          <Pressable style={styles.iconButton} onPress={() => router.canGoBack() && router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.headingText} />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton} onPress={handleSharePress}>
              <Ionicons name="share-outline" size={22} color={COLORS.iconDefault} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleFavoritePress}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? COLORS.dangerText : COLORS.iconDefault}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>

          <View style={styles.infoRow}>
            <Pressable onPress={() => router.push(`/restaurant/${item.restaurantId}`)}>
              <Text style={styles.restaurantLink}>{item.restaurantName}</Text>
            </Pressable>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={COLORS.ratingAmber} />
              <Text style={styles.ratingValue}>{item.avgRating.toFixed(1)}</Text>
              {reviews ? <Text style={styles.ratingCount}>({reviews.total} Ratings)</Text> : null}
            </View>
          </View>

          <View style={styles.stepperRow}>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={20} color={COLORS.paragraphText} />
              </Pressable>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <Pressable style={styles.stepperButton} onPress={() => setQuantity((q) => q + 1)}>
                <Ionicons name="add" size={20} color={COLORS.paragraphText} />
              </Pressable>
            </View>
            <Text style={styles.price}>{item.priceRwf.toLocaleString('en-RW')} RWF</Text>
          </View>

          <View style={styles.tabsRow}>
            <Pressable style={styles.tabItem} onPress={() => setTab('details')}>
              <Text style={[styles.tabLabel, tab === 'details' && styles.tabLabelActive]}>
                Details
              </Text>
              <View style={[styles.tabUnderline, tab === 'details' && styles.tabUnderlineActive]} />
            </Pressable>
            <Pressable style={styles.tabItem} onPress={() => setTab('reviews')}>
              <Text style={[styles.tabLabel, tab === 'reviews' && styles.tabLabelActive]}>
                Reviews
              </Text>
              <View style={[styles.tabUnderline, tab === 'reviews' && styles.tabUnderlineActive]} />
            </Pressable>
          </View>

          {tab === 'details' ? (
            <>
              {ingredients.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <View style={styles.chipRow}>
                    {ingredients.map((ingredient) => (
                      <View key={ingredient} style={styles.chip}>
                        <Ionicons name="leaf-outline" size={16} color={COLORS.lightGreyText} />
                        <Text style={styles.chipLabel}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {item.allergens ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Allergen Warning</Text>
                  <View style={styles.allergenRow}>
                    <Ionicons name="warning-outline" size={20} color={COLORS.dangerText} />
                    <Text style={styles.allergenText}>It contains {item.allergens}</Text>
                  </View>
                </View>
              ) : null}

              {item.similarItems.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Similar Items</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
                    {item.similarItems.map((similar) => (
                      <Pressable
                        key={similar.id}
                        style={styles.similarCard}
                        onPress={() => router.push(`/food/${similar.id}`)}
                      >
                        <FoodProductCard
                          photoUrl={similar.photoUrl}
                          name={similar.name}
                          restaurantName={similar.restaurantName}
                          priceRwf={similar.priceRwf}
                          rating={similar.avgRating}
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
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

      <View style={[styles.cartButtonWrap, { bottom: insets.bottom + SPACING.md }]}>
        <PrimaryButton title={`Add ${quantity} to cart`} onPress={handleAddToCart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  photoWrap: { width: '100%', height: 348 },
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: 140,
    gap: SPACING.xl,
  },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.headingText,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.headingText,
    textDecorationLine: 'underline',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingValue: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.headingText },
  ratingCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.elementBackground,
    borderRadius: RADII.xxl,
    padding: SPACING.xxs,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontFamily: 'Poppins_500Medium', fontSize: 17, color: COLORS.paragraphText },
  price: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: COLORS.primary600 },
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
  section: { gap: SPACING.sm },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.headingText },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
  },
  chipLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  allergenRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  allergenText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  similarRow: { gap: SPACING.xs },
  similarCard: { width: 148, height: 226 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText },
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
  cartButtonWrap: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
  },
});
