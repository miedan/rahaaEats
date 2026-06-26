import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { BackHeader } from '../../components/BackHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { createProfileSchema, CreateProfileFormValues } from '../../utils/validation';
import { updateProfile } from '../../services/profile.service';
import { uploadProfilePhoto } from '../../services/upload.service';
import { ApiError } from '../../services/api';
import { useAddressDraftStore } from '../../store/addressDraftStore';
import { useProfileDraftStore } from '../../store/profileDraftStore';

export default function CreateProfileScreen() {
  const savedAddress = useAddressDraftStore((state) => state.savedAddress);
  const draftFullName = useProfileDraftStore((state) => state.fullName);
  const draftEmail = useProfileDraftStore((state) => state.email);
  const draftPhotoUri = useProfileDraftStore((state) => state.photoUri);
  const setDraftFullName = useProfileDraftStore((state) => state.setFullName);
  const setDraftEmail = useProfileDraftStore((state) => state.setEmail);
  const setDraftPhotoUri = useProfileDraftStore((state) => state.setPhotoUri);
  const resetDraft = useProfileDraftStore((state) => state.reset);
  const [photoUri, setPhotoUri] = useState<string | null>(draftPhotoUri);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: { fullName: draftFullName, email: draftEmail },
  });

  const fullName = watch('fullName');
  const email = watch('email');

  useEffect(() => {
    setDraftFullName(fullName ?? '');
  }, [fullName, setDraftFullName]);

  useEffect(() => {
    setDraftEmail(email ?? '');
  }, [email, setDraftEmail]);

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setDraftPhotoUri(result.assets[0].uri);
    }
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setDraftPhotoUri(result.assets[0].uri);
    }
  }

  function handleAvatarPress() {
    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: pickFromCamera },
      { text: 'Choose from library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function onSubmit(values: CreateProfileFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let profilePhotoUrl: string | undefined;
      if (photoUri && !photoUri.startsWith('http')) {
        profilePhotoUrl = await uploadProfilePhoto(photoUri);
      }
      await updateProfile({
        fullName: values.fullName,
        email: values.email || undefined,
        profilePhotoUrl,
      });
      resetDraft();
      router.replace('/(tabs)');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Create your new{'\n'}profile</Text>

        <View style={styles.formBlock}>
          <Pressable style={styles.avatarWrap} onPress={handleAvatarPress}>
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={48} color={COLORS.iconLight} />
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color={COLORS.iconDefault} />
            </View>
          </Pressable>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <View>
                  <View style={[styles.field, errors.fullName && styles.fieldError]}>
                    <Ionicons name="person-outline" size={24} color={COLORS.iconLight} />
                    <TextInput
                      style={styles.input}
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="First and last name"
                      placeholderTextColor={COLORS.inactiveText}
                    />
                  </View>
                  {errors.fullName ? (
                    <Text style={styles.errorText}>{errors.fullName.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <View>
                  <View style={[styles.field, errors.email && styles.fieldError]}>
                    <Ionicons name="mail-outline" size={24} color={COLORS.iconLight} />
                    <TextInput
                      style={styles.input}
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="email address"
                      placeholderTextColor={COLORS.inactiveText}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
                </View>
              )}
            />

            <Pressable style={styles.field} onPress={() => router.push('/address/search')}>
              <Ionicons name="location-outline" size={24} color={COLORS.iconLight} />
              <Text
                style={[styles.input, !savedAddress && styles.placeholderText]}
                numberOfLines={1}
              >
                {savedAddress?.label ?? 'Address'}
              </Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.iconLight} />
            </Pressable>
          </View>
        </View>

        <View style={styles.spacer} />

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          disabled={!fullName}
          loading={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    color: COLORS.headingText,
    marginBottom: SPACING.lg,
  },
  formBlock: {
    alignItems: 'center',
    gap: SPACING.xl,
  },
  avatarWrap: {
    alignSelf: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: COLORS.elementBackground,
  },
  fields: {
    width: '100%',
    gap: SPACING.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.elementBackground,
    gap: SPACING.sm,
  },
  fieldError: {
    borderColor: COLORS.dangerText,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  placeholderText: {
    color: COLORS.inactiveText,
  },
  errorText: {
    color: COLORS.dangerText,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  spacer: { flex: 1, minHeight: 24 },
});
