import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { getProfile, updateProfile } from '../services/profile.service';
import { getAddresses } from '../services/address.service';
import { uploadProfilePhoto } from '../services/upload.service';
import { ApiError } from '../services/api';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const defaultAddress = addresses?.find((a) => a.isDefault);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setFullName(profile.fullName ?? '');
    setEmail(profile.email ?? '');
    setInitialized(true);
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      let profilePhotoUrl: string | undefined;
      if (photoUri) profilePhotoUrl = await uploadProfilePhoto(photoUri);
      await updateProfile({
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.back();
    } catch (err) {
      Alert.alert('Could not save', err instanceof ApiError ? err.message : 'Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const photoSource = photoUri ?? profile?.profilePhotoUrl;

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <View style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={COLORS.headingText} />
            <Text style={styles.backLabel}>Back</Text>
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>My account</Text>
        <Pressable onPress={handleSave} disabled={isSaving} hitSlop={8}>
          <Text style={[styles.saveLabel, isSaving && styles.saveLabelDisabled]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isLoading && !profile ? (
          <ActivityIndicator color={COLORS.iconPrimary} style={styles.loading} />
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <Pressable style={styles.avatar} onPress={pickPhoto}>
                {photoSource ? (
                  <Image source={{ uri: photoSource }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={40} color={COLORS.iconLight} />
                )}
              </Pressable>
              <Pressable style={styles.cameraButton} onPress={pickPhoto}>
                <Ionicons name="camera" size={18} color={COLORS.iconDefault} />
              </Pressable>
            </View>

            <View style={styles.fields}>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={22} color={COLORS.iconDefault} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.inactiveText}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={22} color={COLORS.iconDefault} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.inactiveText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Pressable
                style={styles.inputRow}
                onPress={() => router.push('/address/manage')}
              >
                <Ionicons name="location-outline" size={22} color={COLORS.iconDefault} />
                <Text style={[styles.input, styles.inputText]} numberOfLines={1}>
                  {defaultAddress?.label ?? 'Set delivery address'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.iconLight} />
              </Pressable>
            </View>
          </>
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
    backgroundColor: COLORS.elementBackground,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  backLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: COLORS.headingText,
  },
  saveLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.primary700,
  },
  saveLabelDisabled: { color: COLORS.disabledText },
  loading: { marginTop: SPACING.xxl },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.xl,
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 120, height: 120 },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.layer1Background,
    borderWidth: 3,
    borderColor: COLORS.elementBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: { width: '100%', gap: SPACING.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    backgroundColor: COLORS.elementBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  inputText: { lineHeight: 20, paddingVertical: 0 },
});
