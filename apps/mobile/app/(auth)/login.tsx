import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { BackHeader } from '../../components/BackHeader';
import { PhoneInput } from '../../components/PhoneInput';
import { PasswordInput } from '../../components/PasswordInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { loginSchema, LoginFormValues } from '../../utils/validation';
import { toE164 } from '../../utils/phone';
import { login } from '../../services/auth.service';
import { ApiError } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { localPhone: '', password: '' },
  });

  const localPhone = watch('localPhone');
  const password = watch('password');
  const isDisabled = !localPhone || !password;

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const phoneNumber = toE164(values.localPhone);
      const result = await login({ phoneNumber, password: values.password });
      await setSession(result.user, result.accessToken, result.refreshToken);
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') {
        setError('password', { message: 'You have entered the incorrect password' });
      } else if (err instanceof ApiError && err.code === 'NOT_VERIFIED') {
        setError('password', { message: 'Account not verified. Check your SMS for the OTP.' });
      } else if (err instanceof ApiError) {
        setError('password', { message: err.message });
      } else {
        setError('password', { message: 'Something went wrong. Try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Log in to your{'\n'}account</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="localPhone"
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChangeText={field.onChange}
                error={errors.localPhone?.message}
              />
            )}
          />

          <View style={styles.fieldSpacing}>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <PasswordInput
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Pressable
            style={styles.forgotLink}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>forgot password</Text>
          </Pressable>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Log in"
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
          loading={isSubmitting}
        />

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.elementBackground,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
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
  form: {
    gap: 0,
  },
  fieldSpacing: {
    marginTop: SPACING.sm,
  },
  forgotLink: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.xs,
    borderRadius: RADII.xs,
    marginTop: SPACING.md,
  },
  forgotText: {
    color: COLORS.primary700,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.lg,
  },
  signupText: {
    color: COLORS.paragraphText,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.headingText,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.linkUnderline,
  },
});
