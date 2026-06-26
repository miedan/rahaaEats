import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { OrderStatus } from '@rahaa/shared';
import { COLORS } from '../../constants/colors';
import { SPACING, RADII } from '../../constants/spacing';
import { getOrder } from '../../services/order.service';

type Stage = 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

const STAGE_BY_STATUS: Record<OrderStatus, Stage> = {
  PLACED: 'preparing',
  PAYMENT_CONFIRMED: 'preparing',
  ACCEPTED_BY_RESTAURANT: 'preparing',
  PREPARING: 'preparing',
  RIDER_ASSIGNED: 'on_the_way',
  READY: 'on_the_way',
  PICKED_UP: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const STAGE_COPY: Record<Stage, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  preparing: {
    title: 'Preparing your order',
    subtitle: 'The restaurant is getting your food ready.',
    icon: 'restaurant-outline',
  },
  on_the_way: {
    title: 'Order on the way',
    subtitle: 'A rider has picked up your order.',
    icon: 'bicycle-outline',
  },
  delivered: {
    title: 'Order delivered',
    subtitle: 'Enjoy your meal!',
    icon: 'checkmark-circle-outline',
  },
  cancelled: {
    title: 'Order cancelled',
    subtitle: 'This order was cancelled.',
    icon: 'close-circle-outline',
  },
};

const STAGE_ORDER: Stage[] = ['preparing', 'on_the_way', 'delivered'];

export default function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>Couldn&apos;t load this order.</Text>
      </View>
    );
  }

  const stage = STAGE_BY_STATUS[order.status];
  const copy = STAGE_COPY[stage];
  const stageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.headingText} />
        </Pressable>
        <Text style={styles.headerTitle}>Track order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <Ionicons
            name={copy.icon}
            size={56}
            color={stage === 'cancelled' ? COLORS.dangerText : COLORS.iconPrimary}
          />
          <Text style={styles.statusTitle}>{copy.title}</Text>
          <Text style={styles.statusSubtitle}>{copy.subtitle}</Text>
        </View>

        {stage !== 'cancelled' ? (
          <View style={styles.progressRow}>
            {STAGE_ORDER.map((s, index) => (
              <View key={s} style={styles.progressSegmentWrap}>
                <View
                  style={[
                    styles.progressDot,
                    index <= stageIndex && styles.progressDotActive,
                  ]}
                />
                {index < STAGE_ORDER.length - 1 ? (
                  <View
                    style={[
                      styles.progressLine,
                      index < stageIndex && styles.progressLineActive,
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restaurant</Text>
            <Text style={styles.detailValue}>{order.restaurant.businessName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deliver to</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {order.deliveryAddress?.label ?? '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>{order.totalRwf.toLocaleString('en-RW')} RWF</Text>
          </View>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.menuItem?.name ?? 'Item'} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.unitPriceRwf * item.quantity).toLocaleString('en-RW')} RWF
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.elementBackground },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.paragraphText },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  headerSpacer: { width: 24 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.lg },
  statusCard: { alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.lg },
  statusTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: COLORS.headingText },
  statusSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
    textAlign: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressSegmentWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.borderDefault,
  },
  progressDotActive: { backgroundColor: COLORS.iconPrimary },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.borderDefault },
  progressLineActive: { backgroundColor: COLORS.iconPrimary },
  detailsCard: { gap: SPACING.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.lightGreyText },
  detailValue: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: COLORS.headingText, maxWidth: 200 },
  itemsCard: {
    gap: SPACING.sm,
    backgroundColor: COLORS.layer1Background,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  itemsTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: COLORS.headingText },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText },
  itemPrice: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: COLORS.headingText },
});
