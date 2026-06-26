import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { DELIVERY_FEE_RWF } from '../../constants/checkout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CartItemRow } from '../../components/CartItemRow';
import { useCartStore } from '../../store/cartStore';
import { useCheckoutStore } from '../../store/checkoutStore';

const VISIBLE_LIMIT = 3;

export default function PlaceOrderScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, VISIBLE_LIMIT);
  const hiddenCount = items.length - VISIBLE_LIMIT;

  const subtotal = items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);
  const discount = appliedCoupon?.discountRwf ?? 0;
  const total = subtotal + DELIVERY_FEE_RWF - discount;

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() && router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.headingText} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Place order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.itemsList}>
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
        </View>

        <Pressable style={styles.couponRow} onPress={() => router.push('/checkout/add-coupon')}>
          <Ionicons name="pricetag-outline" size={24} color={COLORS.iconDefault} />
          {appliedCoupon ? (
            <View style={styles.couponInfo}>
              <Text style={styles.couponLabel}>COUPON</Text>
              <Text style={styles.couponValue}>{appliedCoupon.code}</Text>
            </View>
          ) : (
            <Text style={styles.couponPlaceholder}>Add a coupon</Text>
          )}
          <Ionicons name="chevron-forward" size={24} color={COLORS.iconLight} />
        </Pressable>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString('en-RW')} RWF</Text>
          </View>
          {appliedCoupon ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Coupon</Text>
              <Text style={styles.summaryValue}>-{discount.toLocaleString('en-RW')} RWF</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charges</Text>
            <Text style={styles.summaryValue}>+{DELIVERY_FEE_RWF.toLocaleString('en-RW')} RWF</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('en-RW')} RWF</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <Text style={styles.footerTotal}>{total.toLocaleString('en-RW')} RWF</Text>
        <PrimaryButton title="Proceed to pay" onPress={() => router.push('/checkout')} />
      </View>
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
  backButton: { flexDirection: 'row', alignItems: 'center', width: 60 },
  backLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  headerSpacer: { width: 60 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.lg },
  itemsList: { gap: SPACING.sm },
  moreLink: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.primary700,
    textAlign: 'center',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.md,
  },
  couponInfo: { flex: 1, gap: 2 },
  couponLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  couponValue: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.headingText },
  couponPlaceholder: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.inactiveText },
  summary: { gap: SPACING.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  summaryValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.paragraphText },
  divider: { height: 1, backgroundColor: COLORS.borderDefault },
  totalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 17, color: COLORS.headingText },
  totalValue: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  footer: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  footerTotal: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: COLORS.headingText },
});
