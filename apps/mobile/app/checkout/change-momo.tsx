import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { PhoneInput } from '../../components/PhoneInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCheckoutStore } from '../../store/checkoutStore';
import { getMomoNumbers, addMomoNumber } from '../../services/momo.service';
import { toE164 } from '../../utils/phone';
import { ApiError } from '../../services/api';

export default function ChangeMomoScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const momoNumberId = useCheckoutStore((state) => state.momoNumberId);
  const setMomoNumber = useCheckoutStore((state) => state.setMomoNumber);

  const { data: momoNumbers } = useQuery({ queryKey: ['momoNumbers'], queryFn: getMomoNumbers });
  const [selectedId, setSelectedId] = useState(momoNumberId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDigits, setNewDigits] = useState('');
  const [newProvider, setNewProvider] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [isAdding, setIsAdding] = useState(false);

  function handleSave() {
    const selected = momoNumbers?.find((m) => m.id === selectedId);
    if (selected) setMomoNumber(selected.id, selected.phoneNumber, selected.provider);
    router.back();
  }

  async function handleAddNumber() {
    if (newDigits.length < 9) return;
    setIsAdding(true);
    try {
      const created = await addMomoNumber(toE164(newDigits), newProvider);
      await queryClient.invalidateQueries({ queryKey: ['momoNumbers'] });
      setSelectedId(created.id);
      setShowAddForm(false);
      setNewDigits('');
    } catch (err) {
      Alert.alert('Could not add number', err instanceof ApiError ? err.message : 'Try again.');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Change MoMo</Text>
        <Pressable onPress={handleSave}>
          <Text style={[styles.headerAction, styles.headerActionPrimary]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {(momoNumbers ?? []).map((momo) => {
          const selected = selectedId === momo.id;
          return (
            <Pressable key={momo.id} style={styles.option} onPress={() => setSelectedId(momo.id)}>
              <Text style={styles.optionLabel}>{momo.phoneNumber}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}

        {showAddForm ? (
          <View style={styles.addForm}>
            <PhoneInput value={newDigits} onChangeText={setNewDigits} />
            <View style={styles.providerRow}>
              {(['MTN', 'AIRTEL'] as const).map((provider) => (
                <Pressable
                  key={provider}
                  style={[styles.providerChip, newProvider === provider && styles.providerChipActive]}
                  onPress={() => setNewProvider(provider)}
                >
                  <Text
                    style={[
                      styles.providerChipLabel,
                      newProvider === provider && styles.providerChipLabelActive,
                    ]}
                  >
                    {provider === 'MTN' ? 'MTN MoMo' : 'Airtel Money'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton
              title="Add number"
              onPress={handleAddNumber}
              disabled={newDigits.length < 9}
              loading={isAdding}
            />
          </View>
        ) : (
          <Pressable style={styles.newButton} onPress={() => setShowAddForm(true)}>
            <Ionicons name="add" size={24} color={COLORS.primary700} />
            <Text style={styles.newButtonLabel}>New Mobile</Text>
          </Pressable>
        )}
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    height: 52,
    borderRadius: RADII.sm,
  },
  newButtonLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.primary700 },
  addForm: { gap: SPACING.sm },
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
  providerChipActive: { backgroundColor: COLORS.secondaryBackground, borderColor: COLORS.secondaryBackground },
  providerChipLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.lightGreyText },
  providerChipLabelActive: { fontFamily: 'Poppins_600SemiBold', color: COLORS.headingText },
});
