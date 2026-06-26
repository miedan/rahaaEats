import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { RADII } from '../constants/spacing';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ title, onPress, disabled, loading }: Props) {
  const isDisabled = disabled || loading;

  if (isDisabled) {
    return (
      <View style={[styles.button, styles.disabled]}>
        {loading ? (
          <ActivityIndicator color={COLORS.disabledText} />
        ) : (
          <Text style={[styles.text, styles.disabledText]}>{title}</Text>
        )}
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient
        colors={[COLORS.gradientLight, COLORS.gradientDark]}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
        <View style={styles.bevel} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
  bevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADII.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderBottomColor: '#46890D',
  },
  disabled: {
    backgroundColor: COLORS.disabledBackground,
  },
  text: {
    color: COLORS.white,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  disabledText: {
    color: COLORS.disabledText,
  },
});
