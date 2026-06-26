// Source of truth: Figma "Rahaa-Eats" file, Components page variables (figma.com/design/mnp7IBkcFIyYFKu8dsVbp7)
export const COLORS = {
  primary600: '#54A312',
  primary700: '#408308',
  primary100: '#ECF1E8',
  gradientLight: '#5EAD1D',
  gradientDark: '#54A312',

  headingText: '#363A33',
  paragraphText: '#60655C',
  inactiveText: '#91958E',
  disabledText: '#B6B8B6',
  white: '#FFFFFF',
  dangerText: '#E25839',

  elementBackground: '#FFFFFF',
  secondaryBackground: '#ECF1E8',
  disabledBackground: '#E8EBE6',
  lightRedBackground: '#FEF5F3',
  dangerBackground: '#E25839',
  transparentNav: '#FFFFFFEB',
  layer1Background: '#F9FAF8',
  layer2Background: '#F4F7F2',
  lightGreyText: '#70756B',

  borderDefault: '#E8EBE6',
  borderPrimary: '#54A312',
  linkUnderline: '#24B5D4',

  iconDefault: '#60635E',
  iconPrimary: '#54A312',
  iconDisabled: '#A9ADA5',
  iconLight: '#A9ADA5',
  iconWhite: '#FFFFFF',
  iconRed: '#E25839',

  // legacy aliases kept for screens not yet migrated to the Figma token names above
  primaryGreen: '#54A312',
  darkGreen: '#408308',
  background: '#FFFFFF',
  backgroundSubtle: '#ECF1E8',
  textPrimary: '#363A33',
  textSecondary: '#60655C',
  textMuted: '#91958E',
  errorRed: '#E25839',
  ratingAmber: '#FFC107',
  cardBorder: '#E8EBE6',
  inputBorderDefault: '#E8EBE6',
  inputBorderFocused: '#54A312',
  inputBorderError: '#E25839',
} as const;

// Onboarding screens sit on a dark photo overlay, distinct from the app's light theme above.
export const ONBOARDING_COLORS = {
  headingText: '#EEF0ED',
  bodyText: '#C8C9C7',
  skipButtonBg: '#3B3F38',
  skipButtonText: '#70BA32',
  nextButtonBg: '#6CB231',
  nextButtonHighlight: 'rgba(255,255,255,0.12)',
  nextButtonShadow: '#46890D',
  dotActive: '#6CB231',
  dotInactive: 'rgba(255,255,255,0.3)',
} as const;
