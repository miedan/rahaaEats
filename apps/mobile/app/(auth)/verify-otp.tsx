import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { BackHeader } from '../../components/BackHeader';
import { OTPInput } from '../../components/OTPInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { maskPhone } from '../../utils/phone';
import { verifyOtp, resendOtp } from '../../services/auth.service';
import { ApiError } from '../../services/api';
import { useRegisterStore } from '../../store/registerStore';
import { useAuthStore } from '../../store/authStore';

const RESEND_SECONDS = 60;

export default function VerifyOtpScreen() {
  const phoneNumber = useRegisterStore((state) => state.phoneNumber);
  const resetRegisterFlow = useRegisterStore((state) => state.reset);
  const setSession = useAuthStore((state) => state.setSession);
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleResend() {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    try {
      await resendOtp(phoneNumber, 'REGISTRATION');
      setSecondsLeft(RESEND_SECONDS);
    } finally {
      setIsResending(false);
    }
  }

  async function handleContinue() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyOtp({ phoneNumber, otp });
      await setSession(result.user, result.accessToken, result.refreshToken);
      resetRegisterFlow();
      router.replace('/(auth)/create-profile');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <BackHeader />
      <Text style={styles.title}>Verify your new{'\n'}account</Text>
      <Text style={styles.subtitle}>
        Enter the verification code sent to your phone number {maskPhone(phoneNumber)}.
      </Text>

      <View style={styles.otpWrap}>
        <OTPInput value={otp} onChangeText={setOtp} error={!!error} />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn&apos;t received the code? </Text>
        {secondsLeft > 0 ? (
          <Text style={styles.timerText}>{mm}:{ss} </Text>
        ) : null}
        <Pressable onPress={handleResend} disabled={secondsLeft > 0 || isResending}>
          <Text style={[styles.resendLink, secondsLeft > 0 && styles.resendLinkDisabled]}>
            Resend
          </Text>
        </Pressable>
      </View>

      <View style={styles.spacer} />

      <PrimaryButton
        title="Continue"
        onPress={handleContinue}
        disabled={otp.length < 6}
        loading={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  otpWrap: { marginBottom: 12 },
  errorText: { color: COLORS.errorRed, fontSize: 13, marginBottom: 12 },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendLabel: { fontSize: 13, color: COLORS.textSecondary },
  timerText: { fontSize: 13, color: COLORS.textMuted },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.linkUnderline,
  },
  resendLinkDisabled: {
    color: COLORS.textMuted,
  },
  spacer: { flex: 1, minHeight: 24 },
});
