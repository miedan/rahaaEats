import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (digits: string) => void;
  error?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChangeText, error, placeholder = 'phone number' }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : isFocused
      ? COLORS.inputBorderFocused
      : COLORS.inputBorderDefault;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.prefixBox}>
          <Text style={styles.prefixText}>+250</Text>
        </View>
        <TextInput
          style={[styles.input, { borderColor }]}
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  prefixBox: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorderDefault,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSubtle,
  },
  prefixText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 12,
    marginTop: 4,
  },
});
