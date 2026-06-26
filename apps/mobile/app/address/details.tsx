import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BuildingType } from '@rahaa/shared';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { BackHeader } from '../../components/BackHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAddressDraftStore } from '../../store/addressDraftStore';

const BUILDING_TYPES: { value: BuildingType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'HOUSE', label: 'House', icon: 'home-outline' },
  { value: 'OFFICE', label: 'Office', icon: 'desktop-outline' },
  { value: 'APARTMENT', label: 'Apartment', icon: 'business-outline' },
  { value: 'OTHER', label: 'Other', icon: 'bed-outline' },
];

export default function AddressDetailsScreen() {
  const insets = useSafeAreaInsets();
  const draft = useAddressDraftStore((state) => state.draft);
  const updateDraft = useAddressDraftStore((state) => state.updateDraft);

  const [label, setLabel] = useState(draft?.label ?? '');
  const [buildingType, setBuildingType] = useState<BuildingType | undefined>(draft?.buildingType);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const isReady = label.trim().length > 0 && !!buildingType;
  const selected = BUILDING_TYPES.find((item) => item.value === buildingType);

  function handleContinue() {
    updateDraft({ label: label.trim(), buildingType });
    router.push('/address/details-extra');
  }

  function selectBuildingType(value: BuildingType) {
    setBuildingType(value);
    setIsPickerOpen(false);
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <BackHeader title="Address details" />
      </View>

      <View style={styles.body}>
        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {draft?.formattedAddress ?? ''}
          </Text>
          <Pressable onPress={() => router.push('/address/search?from=details')} hitSlop={8}>
            <Text style={styles.changeLink}>Change</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Address label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. home, work, other"
            placeholderTextColor={COLORS.inactiveText}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Building type</Text>
          <Pressable style={styles.selectInput} onPress={() => setIsPickerOpen(true)}>
            <Text
              style={[styles.selectText, !selected && styles.selectPlaceholder]}
              numberOfLines={1}
            >
              {selected ? selected.label : 'Select building type'}
            </Text>
            <Ionicons name="chevron-down" size={24} color={COLORS.iconDefault} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.navigation, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton title="Continue" onPress={handleContinue} disabled={!isReady} />
      </View>

      <Modal visible={isPickerOpen} transparent animationType="slide" onRequestClose={() => setIsPickerOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setIsPickerOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
          <View style={styles.sheetBar} />
          <View style={styles.sheetTitle}>
            <Text style={styles.sheetTitleLabel}>Building type</Text>
            <Text style={styles.sheetTitleSubtitle}>What kind of place is this?</Text>
          </View>
          <View style={styles.sheetGrid}>
            {BUILDING_TYPES.map((item) => (
              <Pressable
                key={item.value}
                style={styles.sheetCard}
                onPress={() => selectBuildingType(item.value)}
              >
                <Ionicons name={item.icon} size={36} color={COLORS.headingText} />
                <Text style={styles.sheetCardLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.elementBackground,
  },
  header: {
    backgroundColor: COLORS.elementBackground,
  },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.layer1Background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 4,
    gap: SPACING.sm,
  },
  locationText: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.headingText,
  },
  changeLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.headingText,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.linkUnderline,
  },
  field: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
    backgroundColor: COLORS.elementBackground,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.elementBackground,
  },
  selectText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  selectPlaceholder: {
    color: COLORS.inactiveText,
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.transparentNav,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: COLORS.elementBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 24,
    alignItems: 'center',
  },
  sheetBar: {
    width: 100,
    height: 4,
    borderRadius: 16,
    backgroundColor: COLORS.disabledBackground,
  },
  sheetTitle: {
    width: '100%',
    gap: 4,
  },
  sheetTitleLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.lightGreyText,
  },
  sheetTitleSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  sheetCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 76,
    borderRadius: 12,
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sheetCardLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.headingText,
  },
});
