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

export function SearchFoodRow({
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
            <Ionicons name="restaurant-outline" size={24} color={COLORS.iconLight} />
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color={COLORS.ratingAmber} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          {restaurantName}
        </Text>
        <Text style={styles.price}>RWF {priceRwf.toLocaleString('en-RW')}</Text>
      </View>

      <Pressable style={styles.addButton} onPress={onAddPress} hitSlop={8}>
        <Ionicons name="add" size={20} color={COLORS.iconPrimary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 116,
    backgroundColor: COLORS.elementBackground,
    borderWidth: 1,
    borderColor: COLORS.layer2Background,
    borderRadius: RADII.md,
    padding: SPACING.xxs,
    gap: SPACING.xs,
  },
  photoWrap: {
    width: 120,
    height: '100%',
    borderRadius: RADII.sm,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
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
  info: { flex: 1, justifyContent: 'center', gap: SPACING.xxs },
  name: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xxs,
  },
});
