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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { PhoneInput } from '../../components/PhoneInput';
import { PasswordInput } from '../../components/PasswordInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { loginSchema, LoginFormValues } from '../../utils/validation';
import { toE164 } from '../../utils/phone';
import { login } from '../../services/auth.service';
import { ApiError } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
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
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text style={styles.signupText}>Don&apos;t have an account? </Text>
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
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 24,
  },
  form: {
    gap: 0,
  },
  fieldSpacing: {
    marginTop: 12,
  },
  forgotLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotText: {
    color: COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
