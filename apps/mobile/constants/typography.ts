// Source of truth: Figma "Rahaa-Eats" file, Poppins text styles
import { COLORS } from './colors';

export const TYPOGRAPHY = {
  heading1: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    color: COLORS.headingText,
  },
  heading2: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    lineHeight: 24,
    letterSpacing: -0.48,
    color: COLORS.headingText,
  },
  bodyRegular: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.paragraphText,
  },
  bodySemiBold: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.headingText,
  },
  bodyBold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.headingText,
  },
} as const;
