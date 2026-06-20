import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../../../constants/colors';
import { BackHeader } from '../../../components/BackHeader';
import { PhoneInput } from '../../../components/PhoneInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { forgotPasswordPhoneSchema, ForgotPasswordPhoneValues } from '../../../utils/validation';
import { toE164 } from '../../../utils/phone';
import { forgotPassword } from '../../../services/auth.service';
import { usePasswordResetStore } from '../../../store/passwordResetStore';

export default function ForgotPasswordPhoneScreen() {
  const setPhoneNumber = usePasswordResetStore((state) => state.setPhoneNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordPhoneValues>({
    resolver: zodResolver(forgotPasswordPhoneSchema),
    defaultValues: { localPhone: '' },
  });

  const localPhone = watch('localPhone');

  async function onSubmit(values: ForgotPasswordPhoneValues) {
    setIsSubmitting(true);
    try {
      const phoneNumber = toE164(values.localPhone);
      await forgotPassword({ phoneNumber });
      setPhoneNumber(phoneNumber);
      router.push('/(auth)/forgot-password/verify');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <BackHeader />
        <Text style={styles.title}>Forgot your{'\n'}password</Text>
        <Text style={styles.subtitle}>
          Enter your phone number and we&apos;ll send you a verification code.
        </Text>

        <View style={styles.field}>
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
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          disabled={!localPhone || localPhone.length < 9}
          loading={isSubmitting}
        />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  field: {},
  spacer: { flex: 1, minHeight: 24 },
});
