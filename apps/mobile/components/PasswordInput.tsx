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

export function PasswordInput({ value, onChangeText, error, placeholder = 'Password' }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : isFocused
      ? COLORS.inputBorderFocused
      : COLORS.inputBorderDefault;

  return (
    <View>
      <View style={[styles.container, { borderColor }]}>
        <TextInput
          style={styles.input}
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
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.textSecondary}
          />
        </Pressable>
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
