import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SecondaryButton({ title, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    backgroundColor: COLORS.backgroundSubtle,
  },
  disabled: {
    borderColor: COLORS.textMuted,
  },
  text: {
    color: COLORS.primaryGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
