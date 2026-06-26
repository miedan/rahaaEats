import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { useCartStore } from '../../store/cartStore';
import { useCheckoutStore } from '../../store/checkoutStore';
import { getPromoCodes, validatePromo } from '../../services/promo.service';
import { ApiError } from '../../services/api';

export default function AddCouponScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
  const setAppliedCoupon = useCheckoutStore((state) => state.setAppliedCoupon);

  const subtotal = items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);

  const [typedCode, setTypedCode] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(appliedCoupon?.code ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promoCodes'],
    queryFn: getPromoCodes,
  });

  async function handleAddTyped() {
    if (!typedCode.trim()) return;
    setError(null);
    setIsChecking(true);
    try {
      const result = await validatePromo(typedCode.trim().toUpperCase(), subtotal);
      if (!result.valid) {
        setError(result.description);
        return;
      }
      setSelectedCode(typedCode.trim().toUpperCase());
      setTypedCode('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not check that coupon.');
    } finally {
      setIsChecking(false);
    }
  }

  async function handleSave() {
    if (!selectedCode) {
      setAppliedCoupon(null);
      router.back();
      return;
    }
    setIsChecking(true);
    try {
      const result = await validatePromo(selectedCode, subtotal);
      if (!result.valid) {
        setError(result.description);
        return;
      }
      setAppliedCoupon({ code: selectedCode, discountRwf: result.discountRwf });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not apply that coupon.');
    } finally {
      setIsChecking(false);
    }
  }

  function describeDiscount(discountType: string, discountValue: number, minOrderRwf: number): string {
    const amount = discountType === 'PERCENT' ? `${discountValue}%` : `${discountValue.toLocaleString('en-RW')} RWF`;
    return minOrderRwf > 0
      ? `${amount} off on orders above ${minOrderRwf.toLocaleString('en-RW')} RWF`
      : `${amount} off your order`;
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Coupon</Text>
        <Pressable onPress={handleSave} disabled={isChecking}>
          <Text style={[styles.headerAction, styles.headerActionPrimary]}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={typedCode}
              onChangeText={setTypedCode}
              placeholder="type coupon name"
              placeholderTextColor={COLORS.inactiveText}
              autoCapitalize="characters"
            />
          </View>
          <Pressable
            style={[styles.addButton, !typedCode.trim() && styles.addButtonDisabled]}
            onPress={handleAddTyped}
            disabled={!typedCode.trim() || isChecking}
          >
            <Text
              style={[styles.addButtonLabel, !typedCode.trim() && styles.addButtonLabelDisabled]}
            >
              Add
            </Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Select from these</Text>

        {isLoading ? (
          <Text style={styles.emptyText}>Loading coupons...</Text>
        ) : !promoCodes || promoCodes.length === 0 ? (
          <Text style={styles.emptyText}>No coupons available right now.</Text>
        ) : (
          promoCodes.map((promo) => {
            const selected = selectedCode === promo.code;
            return (
              <Pressable
                key={promo.id}
                style={styles.option}
                onPress={() => {
                  setSelectedCode(promo.code);
                  setError(null);
                }}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionCode}>{promo.code}</Text>
                  <Text style={styles.optionDescription}>
                    {describeDiscount(promo.discountType, promo.discountValue, promo.minOrderRwf)}
                  </Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })
        )}
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
  headerAction: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.paragraphText },
  headerActionPrimary: { color: COLORS.primary600 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  body: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.md },
  inputRow: { flexDirection: 'row', alignItems: 'stretch', gap: SPACING.xs },
  inputWrap: { flex: 1 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: { backgroundColor: COLORS.disabledBackground },
  addButtonLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.white },
  addButtonLabelDisabled: { color: COLORS.disabledText },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.dangerText },
  divider: { height: 1, backgroundColor: COLORS.borderDefault },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.lightGreyText, textAlign: 'center' },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText, textAlign: 'center' },
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
  optionCode: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  optionDescription: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.headingText },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.layer2Background,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderWidth: 2, borderColor: COLORS.primary600, backgroundColor: 'transparent' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary600 },
});
