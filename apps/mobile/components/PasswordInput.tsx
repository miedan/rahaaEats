import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
}

export function PasswordInput({ value, onChangeText, error, placeholder = 'password' }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : isFocused
      ? COLORS.inputBorderFocused
      : COLORS.inputBorderDefault;
  const iconColor = error ? COLORS.errorRed : COLORS.textSecondary;

  return (
    <View>
      <View style={[styles.container, { borderColor }, !!error && styles.errorBackground]}>
        <Ionicons name="lock-closed-outline" size={18} color={iconColor} style={styles.lockIcon} />
        <TextInput
          style={[styles.input, !!error && styles.errorText]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={!isVisible}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setIsVisible((prev) => !prev)} hitSlop={8}>
          <Ionicons
            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
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
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  errorBackground: {
    backgroundColor: '#FDECEA',
  },
  lockIcon: {
    marginRight: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.errorRed,
  },
  helperErrorText: {
    color: COLORS.errorRed,
    fontSize: 13,
    marginTop: 8,
  },
});
