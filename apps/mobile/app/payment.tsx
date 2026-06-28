import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { getMomoNumbers, addMomoNumber, setDefaultMomoNumber } from '../services/momo.service';
import { apiRequest } from '../services/api';
import { ApiError } from '../services/api';
import { PhoneInput } from '../components/PhoneInput';
import type { SavedMomoNumber } from '@rahaa/shared';

function deleteMomoNumber(id: string) {
  return apiRequest(`/momo/${id}`, { method: 'DELETE', auth: true });
}

export default function PaymentOptionsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [provider, setProvider] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [isAdding, setIsAdding] = useState(false);

  const { data: momoNumbers, isLoading } = useQuery({
    queryKey: ['momo'],
    queryFn: getMomoNumbers,
  });

  const defaultMomo = momoNumbers?.find((m) => m.isDefault);
  const otherMomos = momoNumbers?.filter((m) => !m.isDefault) ?? [];

  async function handleSetDefault(id: string) {
    try {
      await setDefaultMomoNumber(id);
      await queryClient.invalidateQueries({ queryKey: ['momo'] });
    } catch (err) {
      Alert.alert('Could not update', err instanceof ApiError ? err.message : 'Try again.');
    }
  }

  function handleDelete(momo: SavedMomoNumber) {
    Alert.alert('Remove payment method', `Remove ${momo.phoneNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMomoNumber(momo.id);
            await queryClient.invalidateQueries({ queryKey: ['momo'] });
          } catch (err) {
            Alert.alert('Could not delete', err instanceof ApiError ? err.message : 'Try again.');
          }
        },
      },
    ]);
  }

  async function handleAdd() {
    const cleaned = newPhone.replace(/\s/g, '');
    if (cleaned.length < 9) {
      Alert.alert('Enter a valid phone number');
      return;
    }
    setIsAdding(true);
    try {
      await addMomoNumber(`+250${cleaned}`, provider, !momoNumbers?.length);
      await queryClient.invalidateQueries({ queryKey: ['momo'] });
      setNewPhone('');
      setShowAddForm(false);
    } catch (err) {
      Alert.alert('Could not add', err instanceof ApiError ? err.message : 'Try again.');
    } finally {
      setIsAdding(false);
    }
  }

  function renderMomoRow(momo: SavedMomoNumber) {
    return (
      <View key={momo.id} style={styles.optionRow}>
        <Pressable style={styles.option} onPress={() => handleSetDefault(momo.id)}>
          <View style={styles.momoIcon}>
            <Ionicons name="phone-portrait-outline" size={22} color={COLORS.iconDefault} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionPhone}>{momo.phoneNumber}</Text>
            <Text style={styles.optionProvider}>{momo.provider} MoMo</Text>
          </View>
          <View style={[styles.radio, momo.isDefault && styles.radioSelected]}>
            {momo.isDefault ? <View style={styles.radioDot} /> : null}
          </View>
        </Pressable>
        <Pressable style={styles.editButton} hitSlop={8}>
          <Ionicons name="pencil-outline" size={18} color={COLORS.headingText} />
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(momo)} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={COLORS.dangerText} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <View style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={COLORS.headingText} />
            <Text style={styles.backLabel}>Back</Text>
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>Payment options</Text>
        <Pressable onPress={() => setShowAddForm((v) => !v)} hitSlop={8}>
          <Ionicons name="add" size={26} color={COLORS.primary700} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.iconPrimary} style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {defaultMomo ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Default</Text>
              {renderMomoRow(defaultMomo)}
            </View>
          ) : null}

          {otherMomos.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Others</Text>
              {otherMomos.map(renderMomoRow)}
            </View>
          ) : null}

          {!defaultMomo && otherMomos.length === 0 ? (
            <Text style={styles.emptyText}>No payment methods saved yet.</Text>
          ) : null}

          {showAddForm ? (
            <View style={styles.addForm}>
              <Text style={styles.addFormTitle}>Add MoMo number</Text>
              <PhoneInput
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="7XXXXXXXX"
              />
              <View style={styles.providerRow}>
                {(['MTN', 'AIRTEL'] as const).map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.providerChip, provider === p && styles.providerChipActive]}
                    onPress={() => setProvider(p)}
                  >
                    <Text style={[styles.providerLabel, provider === p && styles.providerLabelActive]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.addButton} onPress={handleAdd} disabled={isAdding}>
                <Text style={styles.addButtonLabel}>{isAdding ? 'Adding…' : 'Add number'}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  loading: { marginTop: SPACING.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, gap: SPACING.xl },
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
    height: 70,
  },
  momoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: { flex: 1, gap: 2 },
  optionPhone: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.headingText },
  optionProvider: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText },
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
  addForm: {
    gap: SPACING.md,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.sm,
    padding: SPACING.lg,
  },
  addFormTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  providerRow: { flexDirection: 'row', gap: SPACING.sm },
  providerChip: {
    flex: 1,
    height: 40,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerChipActive: {
    backgroundColor: COLORS.secondaryBackground,
    borderColor: COLORS.primary600,
  },
  providerLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: COLORS.lightGreyText },
  providerLabelActive: { color: COLORS.primary700, fontFamily: 'Poppins_700Bold' },
  addButton: {
    height: 48,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.white },
});
