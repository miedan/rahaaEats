import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { BackHeader } from '../../components/BackHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAddressDraftStore } from '../../store/addressDraftStore';
import { createAddress, updateAddress } from '../../services/address.service';
import { ApiError } from '../../services/api';

function deriveDistrict(formattedAddress: string | undefined): string {
  if (!formattedAddress) return 'Kigali';
  return formattedAddress.split(',')[0]?.trim() || 'Kigali';
}

export default function AddressDetailsExtraScreen() {
  const insets = useSafeAreaInsets();
  const draft = useAddressDraftStore((state) => state.draft);
  const updateDraft = useAddressDraftStore((state) => state.updateDraft);
  const setSavedAddress = useAddressDraftStore((state) => state.setSavedAddress);
  const editingAddressId = useAddressDraftStore((state) => state.editingAddressId);
  const returnTo = useAddressDraftStore((state) => state.returnTo);
  const clearFlowState = useAddressDraftStore((state) => state.clearFlowState);

  const buildingType = draft?.buildingType;

  const [houseNumber, setHouseNumber] = useState(draft?.houseNumber ?? '');
  const [apartmentName, setApartmentName] = useState(draft?.apartmentName ?? '');
  const [buildingNumber, setBuildingNumber] = useState(
    buildingType === 'APARTMENT' ? draft?.buildingNumber ?? '' : ''
  );
  const [buildingName, setBuildingName] = useState(
    buildingType === 'OFFICE' ? draft?.buildingNumber ?? '' : ''
  );
  const [floorNumber, setFloorNumber] = useState(draft?.floorNumber ?? '');
  const [doorNumber, setDoorNumber] = useState(draft?.doorNumber ?? '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(draft?.deliveryInstructions ?? '');
  const [isDefault, setIsDefault] = useState(draft?.isDefault ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!draft) return;
    setIsSubmitting(true);
    try {
      const payload = {
        label: draft.label ?? 'Address',
        lat: draft.lat,
        lng: draft.lng,
        formattedAddress: draft.formattedAddress,
        buildingType: draft.buildingType,
        houseNumber: buildingType === 'HOUSE' ? houseNumber : undefined,
        apartmentName: buildingType === 'APARTMENT' ? apartmentName : undefined,
        buildingNumber:
          buildingType === 'APARTMENT' ? buildingNumber : buildingType === 'OFFICE' ? buildingName : undefined,
        floorNumber:
          buildingType === 'APARTMENT' || buildingType === 'OFFICE' ? floorNumber : undefined,
        doorNumber:
          buildingType === 'APARTMENT' || buildingType === 'OFFICE' ? doorNumber : undefined,
        district: deriveDistrict(draft.formattedAddress),
        deliveryInstructions: deliveryInstructions || undefined,
        isDefault,
      };

      const address = editingAddressId
        ? await updateAddress(editingAddressId, payload)
        : await createAddress(payload);

      updateDraft({ deliveryInstructions, isDefault });
      setSavedAddress(address);
      const destination = returnTo;
      clearFlowState();
      router.replace(destination as never);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save your address. Try again.';
      Alert.alert('Address not saved', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Address details" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {draft?.formattedAddress ?? ''}
          </Text>
          <Text style={styles.changeLink} onPress={() => router.push('/address/search?from=details')}>
            Change
          </Text>
        </View>

        {buildingType === 'HOUSE' && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>House Number</Text>
            <TextInput
              style={styles.input}
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholder="e.g. 20A"
              placeholderTextColor={COLORS.inactiveText}
            />
          </View>
        )}

        {buildingType === 'APARTMENT' && (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Apartment name</Text>
              <TextInput
                style={styles.input}
                value={apartmentName}
                onChangeText={setApartmentName}
                placeholder="e.g. Canaan Golf Apartments"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Building number</Text>
              <TextInput
                style={styles.input}
                value={buildingNumber}
                onChangeText={setBuildingNumber}
                placeholder="e.g. 20 A"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Floor number</Text>
              <TextInput
                style={styles.input}
                value={floorNumber}
                onChangeText={setFloorNumber}
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Door number</Text>
              <TextInput
                style={styles.input}
                value={doorNumber}
                onChangeText={setDoorNumber}
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
          </>
        )}

        {buildingType === 'OFFICE' && (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Building name</Text>
              <TextInput
                style={styles.input}
                value={buildingName}
                onChangeText={setBuildingName}
                placeholder="e.g. Kigali City Tower"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Floor number</Text>
              <TextInput
                style={styles.input}
                value={floorNumber}
                onChangeText={setFloorNumber}
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Door number</Text>
              <TextInput
                style={styles.input}
                value={doorNumber}
                onChangeText={setDoorNumber}
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.inactiveText}
              />
            </View>
          </>
        )}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Delivery instructions</Text>
          <View style={styles.textArea}>
            <TextInput
              style={styles.textAreaInput}
              value={deliveryInstructions}
              onChangeText={(text) => setDeliveryInstructions(text.slice(0, 200))}
              placeholder="For specific directions or requests (optional)"
              placeholderTextColor={COLORS.inactiveText}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCount}>{deliveryInstructions.length} / 200</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Use as default address</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: COLORS.primary600, false: COLORS.disabledBackground }}
            thumbColor={COLORS.white}
          />
        </View>
      </ScrollView>

      <View style={[styles.navigation, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton title="Continue" onPress={handleContinue} loading={isSubmitting} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.elementBackground,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 120,
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
  textArea: {
    gap: SPACING.xxs,
  },
  textAreaInput: {
    minHeight: 120,
    maxHeight: 188,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    padding: SPACING.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
    backgroundColor: COLORS.elementBackground,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.inactiveText,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.layer1Background,
  },
  toggleLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
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
});
