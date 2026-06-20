import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ title, onPress, disabled, loading }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDisabled ? COLORS.textMuted : COLORS.white} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    backgroundColor: COLORS.darkGreen,
  },
  disabled: {
    backgroundColor: COLORS.inputBorderDefault,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
