import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CartItemRow } from '../../components/CartItemRow';
import { useCartStore } from '../../store/cartStore';

const VISIBLE_LIMIT = 3;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const [showAll, setShowAll] = useState(false);

  const total = items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);
  const visibleItems = showAll ? items : items.slice(0, VISIBLE_LIMIT);
  const hiddenCount = items.length - VISIBLE_LIMIT;

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.headerSpacer} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-handle-outline" size={48} color={COLORS.iconLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from a restaurant to get started.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.listContent}>
            {visibleItems.map((item) => (
              <CartItemRow
                key={item.menuItemId}
                item={item}
                onIncrement={() => setQuantity(item.menuItemId, item.quantity + 1)}
                onDecrement={() => setQuantity(item.menuItemId, item.quantity - 1)}
              />
            ))}
            {!showAll && hiddenCount > 0 ? (
              <Pressable onPress={() => setShowAll(true)}>
                <Text style={styles.moreLink}>+{hiddenCount} more</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={[styles.summary, { paddingBottom: insets.bottom + SPACING.md }]}>
            <Text style={styles.totalValue}>{total.toLocaleString('en-RW')} RWF</Text>
            <PrimaryButton title="Proceed to pay" onPress={() => router.push('/checkout/place-order')} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerSpacer: { width: 60 },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: COLORS.headingText,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: COLORS.headingText },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
    textAlign: 'center',
  },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md },
  moreLink: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.primary700,
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: COLORS.headingText,
  },
});
