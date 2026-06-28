import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { useAuthStore } from '../store/authStore';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.88;

interface DrawerUser {
  fullName: string | null;
  phoneNumber: string;
  profilePhotoUrl?: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  user: DrawerUser | null;
}

const MENU_ITEMS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}[] = [
  { icon: 'person-outline', label: 'My Account', route: '/account' },
  { icon: 'receipt-outline', label: 'My Orders', route: '/orders' },
  { icon: 'card-outline', label: 'Payment', route: '/payment' },
  { icon: 'location-outline', label: 'Addresses', route: '/address/manage' },
  { icon: 'gift-outline', label: 'Subscription', route: '/account' },
];

export function SideDrawer({ visible, onClose, user }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateX]);

  function navigate(route: string) {
    onClose();
    setTimeout(() => router.push(route as never), 250);
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top + SPACING.sm, width: DRAWER_WIDTH },
            { transform: [{ translateX }] },
          ]}
        >
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color={COLORS.headingText} />
          </Pressable>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {user?.profilePhotoUrl ? (
                <Image
                  source={{ uri: user.profilePhotoUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={32} color={COLORS.iconLight} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.fullName ?? 'Your name'}
              </Text>
              <Text style={styles.profilePhone}>{user?.phoneNumber ?? ''}</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>General</Text>
            {MENU_ITEMS.map((item) => (
              <Pressable key={item.label} style={styles.menuRow} onPress={() => navigate(item.route)}>
                <Ionicons name={item.icon} size={22} color={COLORS.iconDefault} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.iconLight} />
              </Pressable>
            ))}
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>Theme</Text>
            <View style={styles.menuRow}>
              <Ionicons name="moon-outline" size={22} color={COLORS.iconDefault} />
              <Text style={styles.menuLabel}>Dark mode</Text>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: COLORS.borderDefault, true: COLORS.primary600 }}
                thumbColor={COLORS.white}
                style={styles.switch}
              />
            </View>
          </View>

          <View style={styles.logoutSection}>
            <Pressable
              style={styles.logoutButton}
              onPress={() => {
                onClose();
                logout();
                router.replace('/(auth)/login');
              }}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.dangerText} />
              <Text style={styles.logoutLabel}>Log out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    flex: 1,
    backgroundColor: COLORS.elementBackground,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
    shadowColor: '#1F1E1D',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 56,
    elevation: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  avatarImage: { width: 80, height: 80 },
  profileInfo: { flex: 1, gap: SPACING.xxs },
  profileName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: COLORS.headingText,
  },
  profilePhone: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.lightGreyText,
  },
  menuSection: { gap: SPACING.xxs },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.lightGreyText,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.xxs,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.headingText,
  },
  switch: { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] },
  logoutSection: { marginTop: 'auto' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.xxs,
  },
  logoutLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.dangerText,
  },
});
