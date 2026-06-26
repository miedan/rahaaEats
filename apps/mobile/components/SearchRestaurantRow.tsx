import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

interface Props {
  logoUrl: string | null;
  businessName: string;
  distanceM?: number;
  rating: number;
  onPress?: () => void;
}

export function SearchRestaurantRow({ logoUrl, businessName, distanceM, rating, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.logoWrap}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Ionicons name="storefront-outline" size={24} color={COLORS.iconLight} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {businessName}
        </Text>
        {distanceM !== undefined ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.lightGreyText} />
            <Text style={styles.distance}>{(distanceM / 1000).toFixed(1)} km away</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={16} color={COLORS.ratingAmber} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elementBackground,
    borderWidth: 1,
    borderColor: COLORS.layer2Background,
    borderRadius: RADII.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: RADII.xs,
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%' },
  logoPlaceholder: {
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: SPACING.xxs },
  name: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs },
  distance: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.lightGreyText,
  },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs },
  ratingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
});
