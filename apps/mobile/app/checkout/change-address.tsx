import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { useCheckoutStore } from '../../store/checkoutStore';
import { useAddressDraftStore } from '../../store/addressDraftStore';
import { getAddresses } from '../../services/address.service';

export default function ChangeAddressScreen() {
  const insets = useSafeAreaInsets();
  const deliveryAddressId = useCheckoutStore((state) => state.deliveryAddressId);
  const setDeliveryAddressId = useCheckoutStore((state) => state.setDeliveryAddressId);
  const setReturnTo = useAddressDraftStore((state) => state.setReturnTo);

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const [selectedId, setSelectedId] = useState(deliveryAddressId);

  function handleSave() {
    if (selectedId) setDeliveryAddressId(selectedId);
    router.back();
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Change address</Text>
        <Pressable onPress={handleSave}>
          <Text style={[styles.headerAction, styles.headerActionPrimary]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {(addresses ?? []).map((address) => {
          const selected = selectedId === address.id;
          return (
            <Pressable key={address.id} style={styles.option} onPress={() => setSelectedId(address.id)}>
              <View style={styles.optionText}>
                <Text style={styles.optionDetail} numberOfLines={1}>
                  {address.formattedAddress ?? address.district}
                </Text>
                <Text style={styles.optionLabel}>{address.label}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}

        <Pressable
          style={styles.newAddressButton}
          onPress={() => {
            setReturnTo('/checkout/change-address');
            router.push('/address/search');
          }}
        >
          <Ionicons name="add" size={24} color={COLORS.primary700} />
          <Text style={styles.newAddressLabel}>New address</Text>
        </Pressable>
      </ScrollView>
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
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.md },
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
  optionDetail: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
  optionLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.headingText },
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
  newAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    height: 52,
    borderRadius: RADII.sm,
  },
  newAddressLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.primary700 },
});
