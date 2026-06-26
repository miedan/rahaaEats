import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

export function BackHeader({ title, onBack, rightAction }: Props) {
  const insets = useSafeAreaInsets();
  const canGoBack = !!onBack || router.canGoBack();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <View style={[styles.row, { marginTop: insets.top + SPACING.sm }]}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.headingText} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {rightAction ? (
          <Pressable onPress={rightAction.onPress} hitSlop={8}>
            <Text style={styles.action}>{rightAction.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: SPACING.lg,
  },
  side: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  backLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.headingText,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.headingText,
  },
  action: {
    color: COLORS.primary600,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
});
