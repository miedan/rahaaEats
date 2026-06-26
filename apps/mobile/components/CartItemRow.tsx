import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import type { CartItem } from '../store/cartStore';

interface Props {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CartItemRow({ item, onIncrement, onDecrement }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.photoWrap}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="restaurant-outline" size={20} color={COLORS.iconLight} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          {item.restaurantName}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.priceRwf.toLocaleString('en-RW')} RWF</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={onDecrement}>
              <Ionicons name="remove" size={16} color={COLORS.paragraphText} />
            </Pressable>
            <Text style={styles.stepperValue}>{item.quantity}</Text>
            <Pressable style={styles.stepperButton} onPress={onIncrement}>
              <Ionicons name="add" size={16} color={COLORS.paragraphText} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    gap: SPACING.xs,
    backgroundColor: COLORS.elementBackground,
    borderWidth: 1,
    borderColor: COLORS.layer2Background,
    borderRadius: RADII.md,
    padding: SPACING.xxs,
    width: '100%',
  },
  photoWrap: { width: 82, height: '100%', borderRadius: RADII.sm, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: SPACING.xs },
  name: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  restaurant: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.lightGreyText },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  price: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.primary600 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.paragraphText },
});
