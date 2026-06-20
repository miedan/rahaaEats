import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile — coming in Phase 1.5</Text>
      <View style={styles.button}>
        <PrimaryButton title="Log out" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 },
  text: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 24 },
  button: { width: '100%' },
});
