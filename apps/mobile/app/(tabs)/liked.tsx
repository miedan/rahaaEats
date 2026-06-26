import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { SearchFoodRow } from '../../components/SearchFoodRow';
import { getFavorites } from '../../services/favorite.service';
import { useAddToCart } from '../../utils/useAddToCart';

export default function LikedScreen() {
  const insets = useSafeAreaInsets();
  const addToCart = useAddToCart();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={COLORS.iconLight} />
        <Text style={styles.title}>No favorites yet</Text>
        <Text style={styles.subtitle}>Items you like will show up here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Text style={[styles.heading, { paddingTop: insets.top + SPACING.lg }]}>Liked</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.elementBackground,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.xs,
  },
  heading: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.headingText,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.headingText,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
    textAlign: 'center',
  },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
});
