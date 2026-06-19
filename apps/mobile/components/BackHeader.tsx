import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/colors';

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

export function BackHeader({ title, onBack, rightAction }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack ?? router.back} hitSlop={8} style={styles.side}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
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
