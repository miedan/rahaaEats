import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
  insets: { bottom: number };
};

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  explore: { active: 'compass', inactive: 'compass-outline' },
  cart: { active: 'bag-handle', inactive: 'bag-handle-outline' },
  liked: { active: 'heart', inactive: 'heart-outline' },
};

export function BottomNav({ state, navigation, insets }: TabBarProps) {
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.xs }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;

          function handlePress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable key={route.key} style={styles.tab} onPress={handlePress} hitSlop={8}>
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={28}
                color={isFocused ? COLORS.iconPrimary : COLORS.iconLight}
                style={isFocused ? styles.tilted : undefined}
              />
              {isFocused ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: RADII.sm,
    borderTopRightRadius: RADII.sm,
    backgroundColor: COLORS.transparentNav,
    paddingTop: SPACING.xs,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
  },
  tab: {
    width: 32,
    height: 38,
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  tilted: {
    transform: [{ rotate: '-15deg' }],
  },
  dot: {
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: COLORS.iconPrimary,
  },
});
