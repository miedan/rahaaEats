import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

type Language = 'en' | 'rw' | 'sw';

const LANGUAGES: { id: Language; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'rw', label: 'Kinyarwanda', native: 'Kinyarwanda' },
  { id: 'sw', label: 'Swahili', native: 'Kiswahili' },
];

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Language>('en');

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Language</Text>
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <Text style={styles.saveLabel}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.id}
            style={styles.optionRow}
            onPress={() => setSelected(lang.id)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionLabel}>{lang.label}</Text>
              {lang.native !== lang.label ? (
                <Text style={styles.optionNative}>{lang.native}</Text>
              ) : null}
            </View>
            <View style={[styles.radio, selected === lang.id && styles.radioSelected]}>
              {selected === lang.id ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  cancelLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  saveLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.primary700 },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.xxs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.md,
  },
  optionLeft: { gap: 2 },
  optionLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.headingText },
  optionNative: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.paragraphText },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.layer2Background,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderWidth: 2, borderColor: COLORS.primary600, backgroundColor: 'transparent' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary600 },
});
