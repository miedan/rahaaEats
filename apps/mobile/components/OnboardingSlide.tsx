import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_COLORS } from '../constants/colors';

interface Props {
  image: number;
  title: string;
  subtitle: string;
  width: number;
  footerHeight: number;
}

export function OnboardingSlide({ image, title, subtitle, width, footerHeight }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={image} style={[styles.slide, { width }]} resizeMode="cover">
      <LinearGradient
        colors={['rgba(38,39,37,0)', 'rgba(38,39,37,0.92)']}
        locations={[0.45, 1]}
        style={styles.gradient}
      />
      <View style={[styles.brandRow, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require('../assets/images/branding/logo-green.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.brandText}>Rahaa</Text>
      </View>
      <View style={[styles.textBlock, { paddingBottom: footerHeight + 24 }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 20,
  },
  logo: {
    width: 60,
    height: 35,
  },
  brandText: {
    color: ONBOARDING_COLORS.headingText,
    fontSize: 24,
    lineHeight: 33,
  },
  textBlock: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    color: ONBOARDING_COLORS.headingText,
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    marginBottom: 16,
  },
  subtitle: {
    color: ONBOARDING_COLORS.bodyText,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 26,
  },
});
