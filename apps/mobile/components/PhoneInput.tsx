import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (digits: string) => void;
  error?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChangeText, error, placeholder = '78 123 4567' }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : isFocused
      ? COLORS.inputBorderFocused
      : COLORS.inputBorderDefault;

  return (
    <View>
      <View style={[styles.container, { borderColor }]}>
        <Text style={styles.prefix}>+250</Text>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 9))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          maxLength={9}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  prefix: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 12,
    marginTop: 4,
  },
});
