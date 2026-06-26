import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { BackHeader } from '../components/BackHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { getProfile } from '../services/profile.service';

const MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; route?: string }[] = [
  { icon: 'location-outline', label: 'My addresses', route: '/address/manage' },
  { icon: 'receipt-outline', label: 'Order history' },
  { icon: 'heart-outline', label: 'Favorites', route: '/(tabs)/liked' },
  { icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen() {
  const sessionUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const fullName = profile?.fullName ?? sessionUser?.fullName ?? '';
  const phoneNumber = profile?.phoneNumber ?? sessionUser?.phoneNumber ?? '';
  const email = profile?.email ?? null;
  const photoUrl = profile?.profilePhotoUrl ?? null;

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.flex}>
      <BackHeader title="Profile" />

      {isLoading && !sessionUser ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.iconPrimary} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={36} color={COLORS.iconLight} />
              )}
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={1}>
                {fullName || 'Your name'}
              </Text>
              <Text style={styles.phone}>{phoneNumber}</Text>
              {email ? <Text style={styles.email}>{email}</Text> : null}
            </View>
          </View>

          {isError ? (
            <Text style={styles.errorText}>Couldn&apos;t refresh your profile. Showing cached info.</Text>
          ) : null}

          <View style={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuRow}
                onPress={() => item.route && router.push(item.route as never)}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.iconDefault} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.iconLight} />
              </Pressable>
            ))}
          </View>

          <View style={styles.spacer} />

          <PrimaryButton title="Log out" onPress={handleLogout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 72, height: 72 },
  identityText: { flex: 1, gap: SPACING.xxs },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: COLORS.headingText,
  },
  phone: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
  },
  email: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
  },
  errorText: {
    marginTop: SPACING.sm,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.dangerText,
  },
  menu: {
    marginTop: SPACING.xl,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.layer1Background,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDefault,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  spacer: { flex: 1, minHeight: SPACING.xl },
});
