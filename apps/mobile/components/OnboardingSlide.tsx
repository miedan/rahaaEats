import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

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
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        locations={[0.4, 1]}
        style={styles.gradient}
      />
      <View style={[styles.brandRow, { paddingTop: insets.top + 16 }]}>
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
    gap: 8,
    paddingHorizontal: 24,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  textBlock: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
});
