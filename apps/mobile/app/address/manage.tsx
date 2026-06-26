import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Address } from '@rahaa/shared';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { getAddresses, deleteAddress, setDefaultAddress } from '../../services/address.service';
import { ApiError } from '../../services/api';
import { useAddressDraftStore } from '../../store/addressDraftStore';

export default function ManageAddressesScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const startEditing = useAddressDraftStore((state) => state.startEditing);
  const setReturnTo = useAddressDraftStore((state) => state.setReturnTo);

  const defaultAddress = addresses?.find((a) => a.isDefault);
  const otherAddresses = addresses?.filter((a) => !a.isDefault) ?? [];

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress(id);
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      Alert.alert('Could not set default', err instanceof ApiError ? err.message : 'Try again.');
    }
  }

  function handleDelete(address: Address) {
    Alert.alert('Delete address', `Remove "${address.label}" from your saved addresses?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(address.id);
            await queryClient.invalidateQueries({ queryKey: ['addresses'] });
          } catch (err) {
            Alert.alert('Could not delete', err instanceof ApiError ? err.message : 'Try again.');
          }
        },
      },
    ]);
  }

  function handleEdit(address: Address) {
    startEditing(address);
    router.push('/address/details');
  }

  function renderOption(address: Address) {
    return (
      <View key={address.id} style={styles.optionRow}>
        <Pressable style={styles.option} onPress={() => handleSetDefault(address.id)}>
          <View style={styles.optionText}>
            <Text style={styles.optionDetail} numberOfLines={1}>
              {address.formattedAddress ?? address.district}
            </Text>
            <Text style={styles.optionLabel}>{address.label}</Text>
          </View>
          <View style={[styles.radio, address.isDefault && styles.radioSelected]}>
            {address.isDefault ? <View style={styles.radioDot} /> : null}
          </View>
        </Pressable>
        <Pressable style={styles.editButton} onPress={() => handleEdit(address)} hitSlop={8}>
          <Ionicons name="pencil-outline" size={18} color={COLORS.headingText} />
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(address)} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={COLORS.dangerText} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()}>
          <Text style={styles.headerAction}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Address options</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {defaultAddress ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Default</Text>
            {renderOption(defaultAddress)}
          </View>
        ) : null}

        {otherAddresses.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Others</Text>
            {otherAddresses.map(renderOption)}
          </View>
        ) : null}

        {!defaultAddress && otherAddresses.length === 0 ? (
          <Text style={styles.emptyText}>No saved addresses yet.</Text>
        ) : null}

        <Pressable
          style={styles.newButton}
          onPress={() => {
            setReturnTo('/address/manage');
            router.push('/address/search');
          }}
        >
          <Ionicons name="add" size={24} color={COLORS.primary700} />
          <Text style={styles.newButtonLabel}>New address</Text>
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
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.xl },
  section: { gap: SPACING.md },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.lightGreyText,
    textAlign: 'center',
  },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText, textAlign: 'center' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  option: {
    flex: 1,
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
  editButton: {
    width: 46,
    height: 70,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 46,
    height: 70,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    height: 52,
    borderRadius: RADII.sm,
  },
  newButtonLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.primary700 },
});
