import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

interface Props {
  photoUrl: string | null;
  name: string;
  restaurantName: string;
  priceRwf: number;
  rating: number;
  onPress?: () => void;
  onAddPress?: () => void;
}

export function FoodProductCard({
  photoUrl,
  name,
  restaurantName,
  priceRwf,
  rating,
  onPress,
  onAddPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoWrap}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="restaurant-outline" size={28} color={COLORS.iconLight} />
          </View>
        )}

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color={COLORS.ratingAmber} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>

        <Pressable style={styles.addButton} onPress={onAddPress} hitSlop={8}>
          <Ionicons name="add" size={20} color={COLORS.iconPrimary} />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          {restaurantName}
        </Text>
        <Text style={styles.price}>{priceRwf.toLocaleString('en-RW')} RWF</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.elementBackground,
    borderWidth: 1,
    borderColor: COLORS.layer2Background,
    borderRadius: RADII.md,
    paddingTop: SPACING.xxs,
    paddingHorizontal: SPACING.xxs,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  photoWrap: {
    height: 132,
    borderRadius: RADII.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.xxs,
    paddingVertical: 2,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.transparentNav,
  },
  ratingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  addButton: {
    position: 'absolute',
    bottom: 4,
    right: 4.5,
    width: 32,
    height: 32,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xxs,
  },
  name: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  restaurant: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.lightGreyText,
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.primary600,
  },
});
