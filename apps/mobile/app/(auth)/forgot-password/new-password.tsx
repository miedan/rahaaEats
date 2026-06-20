import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../../../constants/colors';
import { BackHeader } from '../../../components/BackHeader';
import { PasswordInput } from '../../../components/PasswordInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { newPasswordSchema, NewPasswordFormValues } from '../../../utils/validation';
import { resetPassword } from '../../../services/auth.service';
import { ApiError } from '../../../services/api';
import { usePasswordResetStore } from '../../../store/passwordResetStore';

const OTP_ERROR_CODES = ['OTP_EXPIRED', 'OTP_NOT_FOUND', 'OTP_INVALID', 'OTP_LOCKED_OUT', 'OTP_MAX_ATTEMPTS'];

export default function CreateNewPasswordScreen() {
  const phoneNumber = usePasswordResetStore((state) => state.phoneNumber);
  const otp = usePasswordResetStore((state) => state.otp);
  const resetFlow = usePasswordResetStore((state) => state.reset);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  async function onSubmit(values: NewPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await resetPassword({ phoneNumber, otp, newPassword: values.newPassword });
      resetFlow();
      router.replace('/(auth)/login');
    } catch (err) {
      if (err instanceof ApiError && OTP_ERROR_CODES.includes(err.code)) {
        setError('confirmPassword', {
          message: `${err.message} Go back and request a new code.`,
        });
      } else if (err instanceof ApiError) {
        setError('confirmPassword', { message: err.message });
      } else {
        setError('confirmPassword', { message: 'Something went wrong. Try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <BackHeader />
        <Text style={styles.title}>Create a new{'\n'}password</Text>
        <Text style={styles.subtitle}>Enter a new password and try not to forget it.</Text>

        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <PasswordInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="new password"
              error={errors.newPassword?.message}
            />
          )}
        />

        <View style={styles.fieldSpacing}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <PasswordInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="re-enter the new password"
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          disabled={!newPassword || !confirmPassword}
          loading={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  fieldSpacing: { marginTop: 12 },
  spacer: { flex: 1, minHeight: 24 },
});
