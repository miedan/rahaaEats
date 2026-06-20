import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

export function BackHeader({ title, onBack, rightAction }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { marginTop: insets.top + 8 }]}>
      <Pressable
        onPress={onBack ?? router.back}
        hitSlop={8}
        style={[styles.side, styles.backButton]}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>
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
  },
  side: {
    minWidth: 32,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  action: {
    color: COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: '600',
  },
});
