import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

interface Props {
  emoji: string;
  label: string;
  onPress?: () => void;
}

export function CategoryChip({ emoji, label, onPress }: Props) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  emojiWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.headingText,
  },
});
