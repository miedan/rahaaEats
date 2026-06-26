import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
}

export function PasswordInput({ value, onChangeText, error, placeholder = 'password' }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const borderWidth = isFocused && !error ? 2 : 1;
  const borderColor = error
    ? COLORS.dangerText
    : isFocused
      ? COLORS.borderPrimary
      : COLORS.borderDefault;
  const iconColor = error ? COLORS.dangerText : COLORS.iconDefault;

  return (
    <View>
      <View
        style={[styles.container, { borderColor, borderWidth }, !!error && styles.errorBackground]}
      >
        <Ionicons name="lock-closed-outline" size={24} color={iconColor} style={styles.lockIcon} />
        <TextInput
          style={[styles.input, !!error && styles.errorText]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={!isVisible}
          placeholder={placeholder}
          placeholderTextColor={COLORS.disabledText}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setIsVisible((prev) => !prev)} hitSlop={8}>
          <Ionicons
            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color={iconColor}
          />
        </Pressable>
      </View>
      {error ? <Text style={styles.helperErrorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.elementBackground,
    gap: SPACING.sm,
  },
  errorBackground: {
    backgroundColor: COLORS.lightRedBackground,
  },
  lockIcon: {
    marginRight: 0,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  errorText: {
    color: COLORS.dangerText,
  },
  helperErrorText: {
    color: COLORS.dangerText,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: SPACING.xs,
  },
});
