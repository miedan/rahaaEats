import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { BackHeader } from '../../components/BackHeader';
import { PhoneInput } from '../../components/PhoneInput';
import { PasswordInput } from '../../components/PasswordInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { registerSchema, RegisterFormValues } from '../../utils/validation';
import { toE164 } from '../../utils/phone';
import { register } from '../../services/auth.service';
import { ApiError } from '../../services/api';
import { useRegisterStore } from '../../store/registerStore';

export default function RegisterScreen() {
  const setPhoneNumber = useRegisterStore((state) => state.setPhoneNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { localPhone: '', password: '', agreedToTerms: false },
  });

  const localPhone = watch('localPhone');
  const password = watch('password');
  const agreedToTerms = watch('agreedToTerms');
  const isDisabled = !localPhone || !password || !agreedToTerms;

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      const phoneNumber = toE164(values.localPhone);
      await register({ phoneNumber, password: values.password });
      setPhoneNumber(phoneNumber);
      router.push('/(auth)/verify-otp');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PHONE_TAKEN') {
        setError('localPhone', { message: 'This phone number is already registered' });
      } else if (err instanceof ApiError) {
        setError('localPhone', { message: err.message });
      } else {
        setError('localPhone', { message: 'Something went wrong. Try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <BackHeader />
        <Text style={styles.title}>Create a new{'\n'}account</Text>

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
                placeholder="Create password"
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="agreedToTerms"
          render={({ field }) => (
            <Pressable
              style={styles.termsRow}
              onPress={() => field.onChange(!field.value)}
              hitSlop={8}
            >
              <View style={[styles.checkbox, field.value && styles.checkboxChecked]}>
                {field.value ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : null}
              </View>
              <Text style={styles.termsText}>I agree to terms &amp; conditions</Text>
            </Pressable>
          )}
        />
        {errors.agreedToTerms ? (
          <Text style={styles.termsError}>{errors.agreedToTerms.message}</Text>
        ) : null}

        <View style={styles.spacer} />

        <PrimaryButton
          title="Create account"
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
          loading={isSubmitting}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 24,
  },
  fieldSpacing: { marginTop: 12 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  termsError: {
    color: COLORS.errorRed,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 30,
  },
  spacer: { flex: 1, minHeight: 24 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
