import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

interface Props {
  value: string;
  onChangeText: (digits: string) => void;
  error?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChangeText, error, placeholder = 'phone number' }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const borderWidth = isFocused && !error ? 2 : 1;
  const borderColor = error
    ? COLORS.dangerText
    : isFocused
      ? COLORS.borderPrimary
      : COLORS.borderDefault;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.prefixBox}>
          <Text style={styles.prefixText} numberOfLines={1}>
            +250
          </Text>
        </View>
        <TextInput
          style={[styles.input, { borderColor, borderWidth }]}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 9))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor={COLORS.disabledText}
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
    gap: SPACING.xs,
  },
  prefixBox: {
    height: 48,
    minWidth: 68,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.disabledBackground,
  },
  prefixText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.disabledText,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
    backgroundColor: COLORS.elementBackground,
  },
  errorText: {
    color: COLORS.dangerText,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: SPACING.xs,
  },
});
