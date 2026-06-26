import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { DELIVERY_FEE_RWF } from '../../constants/checkout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCartStore } from '../../store/cartStore';
import { useCheckoutStore } from '../../store/checkoutStore';
import { getAddresses } from '../../services/address.service';
import { getMomoNumbers } from '../../services/momo.service';
import { createOrder } from '../../services/order.service';
import { ApiError } from '../../services/api';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const deliveryAddressId = useCheckoutStore((state) => state.deliveryAddressId);
  const setDeliveryAddressId = useCheckoutStore((state) => state.setDeliveryAddressId);
  const momoNumberId = useCheckoutStore((state) => state.momoNumberId);
  const momoPhone = useCheckoutStore((state) => state.momoPhone);
  const momoProvider = useCheckoutStore((state) => state.momoProvider);
  const setMomoNumber = useCheckoutStore((state) => state.setMomoNumber);
  const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
  const resetCheckout = useCheckoutStore((state) => state.reset);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const { data: momoNumbers } = useQuery({ queryKey: ['momoNumbers'], queryFn: getMomoNumbers });

  useEffect(() => {
    if (!deliveryAddressId && addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setDeliveryAddressId(def.id);
    }
  }, [addresses, deliveryAddressId, setDeliveryAddressId]);

  useEffect(() => {
    if (!momoNumberId && momoNumbers && momoNumbers.length > 0) {
      const def = momoNumbers.find((m) => m.isDefault) ?? momoNumbers[0];
      setMomoNumber(def.id, def.phoneNumber, def.provider);
    }
  }, [momoNumbers, momoNumberId, setMomoNumber]);

  const selectedAddress = addresses?.find((a) => a.id === deliveryAddressId);

  const subtotal = items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);
  const discount = appliedCoupon?.discountRwf ?? 0;
  const total = subtotal + DELIVERY_FEE_RWF - discount;
  const restaurantId = items[0]?.restaurantId;

  async function handleProceedToPay() {
    if (!selectedAddress) {
      Alert.alert('Choose a delivery address', 'Please select where this order should be delivered.');
      return;
    }
    if (!momoPhone) {
      Alert.alert('Choose a MoMo number', 'Please select which number to pay from.');
      return;
    }
    if (!restaurantId) {
      Alert.alert('Your cart is empty', 'Add items to your cart before checking out.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await createOrder({
        restaurantId,
        items: items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
        deliveryAddressId: selectedAddress.id,
        paymentMethod: momoProvider === 'AIRTEL' ? 'MOMO_AIRTEL' : 'MOMO_MTN',
        promoCode: appliedCoupon?.code,
      });
      clearCart();
      resetCheckout();
      router.replace({ pathname: '/checkout/order-placed', params: { orderId: order.id } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not place your order. Try again.';
      Alert.alert('Order failed', message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() && router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.headingText} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.option} onPress={() => router.push('/checkout/change-address')}>
          <Ionicons name="location-outline" size={24} color={COLORS.iconDefault} />
          <View style={styles.optionText}>
            <Text style={styles.optionLabel}>Deliver to</Text>
            <Text style={styles.optionValue} numberOfLines={1}>
              {selectedAddress
                ? `${selectedAddress.label}${selectedAddress.formattedAddress ? ` - ${selectedAddress.formattedAddress}` : ''}`
                : 'Add a delivery address'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.iconLight} />
        </Pressable>

        <Pressable style={styles.option} onPress={() => router.push('/checkout/change-momo')}>
          <Ionicons name="card-outline" size={24} color={COLORS.iconDefault} />
          <View style={styles.optionText}>
            <Text style={styles.optionLabel}>Payment from</Text>
            <Text style={styles.optionValue} numberOfLines={1}>
              {momoPhone ?? 'Add a MoMo number'}
            </Text>
          </View>
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
        <PrimaryButton
          title="Proceed to pay"
          onPress={handleProceedToPay}
          loading={isPlacingOrder}
          disabled={!selectedAddress || !momoPhone}
        />
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
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  optionValue: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.headingText },
  summary: { gap: SPACING.xs, marginTop: SPACING.sm },
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
