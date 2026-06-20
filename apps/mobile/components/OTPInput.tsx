import { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';

const LENGTH = 6;

interface Props {
  value: string;
  onChangeText: (otp: string) => void;
  onComplete?: (otp: string) => void;
  error?: boolean;
}

export function OTPInput({ value, onChangeText, onComplete, error }: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (value.length === LENGTH) onComplete?.(value);
  }, [value]);

  function handleChange(text: string, index: number) {
    const next = digits.slice();
    next[index] = text.replace(/\D/g, '').slice(-1);
    const joined = next.join('').slice(0, LENGTH);
    onChangeText(joined);

    if (text && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (text && joined.length === LENGTH) {
      inputs.current[index]?.blur();
      Keyboard.dismiss();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          style={[
            styles.box,
            {
              borderColor: error
                ? COLORS.inputBorderError
                : focusedIndex === index
                  ? COLORS.inputBorderFocused
                  : COLORS.inputBorderDefault,
            },
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
});
