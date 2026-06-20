import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { markOnboardingSeen } from '../utils/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    image: require('../assets/images/onboarding/onboarding-1.png'),
    title: 'Good food is\none tap away',
    subtitle: 'Welcome to Rahaa Eats, order from the best restaurants in Kigali and get it delivered fast.',
  },
  {
    image: require('../assets/images/onboarding/onboarding-2.png'),
    title: 'Fresh, hot, and at\nyour door',
    subtitle: 'We connect you with nearby restaurants and riders who know Kigali inside out.',
  },
  {
    image: require('../assets/images/onboarding/onboarding-3.png'),
    title: 'Order in seconds,\npay how you like',
    subtitle: 'MTN MoMo, Airtel Money, or cash, checkout is quick and your order is tracked live.',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const isLast = activeIndex === SLIDES.length - 1;

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height);
  }

  async function finish() {
    await markOnboardingSeen();
    router.replace('/(auth)/login');
  }

  function handleNext() {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <OnboardingSlide
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            width={SCREEN_WIDTH}
            footerHeight={footerHeight}
          />
        )}
      />

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}
        onLayout={handleFooterLayout}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {isLast ? (
          <Pressable style={styles.getStartedButton} onPress={finish}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable style={styles.skipButton} onPress={finish}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primaryGreen,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
