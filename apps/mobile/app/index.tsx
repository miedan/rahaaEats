import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/authStore';
import { hasSeenOnboarding } from '../utils/onboarding';

function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require('../assets/images/branding/logo-white.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <View style={styles.wordmark}>
        <Text style={styles.rahaaText}>Rahaa</Text>
        <Text style={styles.eatsText}>Eats</Text>
      </View>
    </View>
  );
}

const MIN_SPLASH_MS = 1200;

export default function Index() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);

  useEffect(() => {
    // TEMP: force onboarding to always show for testing — revert before shipping
    hasSeenOnboarding().then(() => setSeenOnboarding(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated || seenOnboarding === null || !minDelayElapsed) {
    return <SplashScreen />;
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  if (!seenOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.primaryGreen,
  },
  logo: {
    width: 56,
    height: 56,
  },
  wordmark: {
    alignItems: 'flex-start',
  },
  rahaaText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 26,
  },
  eatsText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
});
