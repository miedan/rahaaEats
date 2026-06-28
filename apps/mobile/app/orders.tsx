import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { OrderDetail, OrderStatus } from '@rahaa/shared';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { getOrders } from '../services/order.service';
import { RateFoodModal } from '../components/RateFoodModal';

type Tab = 'current' | 'previous';

const ACTIVE_STATUSES: OrderStatus[] = [
  'PLACED',
  'PAYMENT_CONFIRMED',
  'ACCEPTED_BY_RESTAURANT',
  'PREPARING',
  'RIDER_ASSIGNED',
  'READY',
  'PICKED_UP',
];

function statusLabel(status: OrderStatus): string {
  if (['PLACED', 'PAYMENT_CONFIRMED'].includes(status)) return 'Order placed';
  if (['ACCEPTED_BY_RESTAURANT', 'PREPARING', 'READY'].includes(status)) return 'Preparing';
  if (['RIDER_ASSIGNED', 'PICKED_UP'].includes(status)) return 'Out for delivery';
  if (status === 'DELIVERED') return 'Order delivered';
  return 'Order cancelled';
}

interface RateTarget { orderId: string; menuItemId: string }

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('current');
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const currentOrders = (orders ?? []).filter((o) => ACTIVE_STATUSES.includes(o.status));
  const previousOrders = (orders ?? []).filter(
    (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED'
  );

  function handleRate(order: OrderDetail) {
    const firstItem = order.items[0];
    if (!firstItem?.menuItem) return;
    setRateTarget({ orderId: order.id, menuItemId: firstItem.menuItemId });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn&apos;t load orders. Try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <View style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={COLORS.headingText} />
            <Text style={styles.backLabel}>Back</Text>
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.iconDefault} />
      </View>

      <View style={styles.tabsRow}>
        <View style={styles.tabsLeft}>
          <Pressable
            style={[styles.tab, tab === 'current' && styles.tabActive]}
            onPress={() => setTab('current')}
          >
            <Text style={[styles.tabLabel, tab === 'current' && styles.tabLabelActive]}>
              Current
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'previous' && styles.tabActive]}
            onPress={() => setTab('previous')}
          >
            <Text style={[styles.tabLabel, tab === 'previous' && styles.tabLabelActive]}>
              Previous
            </Text>
          </Pressable>
        </View>
        <Pressable style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={COLORS.iconDefault} />
        </Pressable>
      </View>

      {tab === 'current' ? (
        currentOrders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No active orders right now.</Text>
          </View>
        ) : (
          <FlatList
            data={currentOrders}
            keyExtractor={(o) => o.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item: order }) => (
              <OrderCard
                order={order}
                type="current"
                onTrack={() => router.push(`/order/${order.id}`)}
              />
            )}
          />
        )
      ) : previousOrders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No previous orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={previousOrders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: order }) => (
            <OrderCard
              order={order}
              type="previous"
              onRate={() => handleRate(order)}
            />
          )}
        />
      )}

      {rateTarget ? (
        <RateFoodModal
          visible
          orderId={rateTarget.orderId}
          menuItemId={rateTarget.menuItemId}
          onClose={() => setRateTarget(null)}
          onSubmitted={() => setRateTarget(null)}
        />
      ) : null}
    </View>
  );
}

interface OrderCardProps {
  order: OrderDetail;
  type: 'current' | 'previous';
  onTrack?: () => void;
  onRate?: () => void;
}

function OrderCard({ order, type, onTrack, onRate }: OrderCardProps) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;
  const photoUrl = firstItem?.menuItem?.photoUrl ?? null;
  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString('en-RW', {
        day: 'numeric',
        month: 'long',
      })
    : null;

  const summaryText = order.items
    .slice(0, 2)
    .map((i) => `${i.menuItem?.name ?? 'Item'} x${i.quantity}`)
    .join('  ');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.photoCol}>
          <View style={styles.mainPhoto}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.mainPhotoImg} contentFit="cover" />
            ) : (
              <View style={[styles.mainPhotoImg, styles.photoPlaceholder]}>
                <Ionicons name="restaurant-outline" size={24} color={COLORS.iconLight} />
              </View>
            )}
          </View>
          {extraCount > 0 ? (
            <View style={styles.thumbRow}>
              <View style={styles.thumb}>
                {order.items[1]?.menuItem?.photoUrl ? (
                  <Image
                    source={{ uri: order.items[1].menuItem.photoUrl }}
                    style={styles.thumbImg}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.thumbImg, styles.photoPlaceholder]} />
                )}
              </View>
              {extraCount > 1 ? (
                <View style={[styles.thumb, styles.extraThumb]}>
                  <Text style={styles.extraThumbText}>+{extraCount}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.statusLabel}>{statusLabel(order.status)}</Text>
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>
                {type === 'current' ? 'Est. delivery' : 'Delivered on'}
              </Text>
              <Text style={styles.infoVal}>
                {type === 'current' ? '30mins' : deliveredDate ?? '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Order summary</Text>
              <Text style={styles.infoVal} numberOfLines={1}>
                {summaryText}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Total price paid</Text>
              <Text style={styles.totalVal}>
                RWF {order.totalRwf.toLocaleString('en-RW')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionButton}
          onPress={type === 'current' ? onTrack : onRate}
        >
          <Text style={styles.actionButtonLabel}>
            {type === 'current' ? 'Track order' : 'Reorder'}
          </Text>
        </Pressable>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.iconDefault} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.paragraphText },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.elementBackground,
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: COLORS.headingText },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  tabsLeft: { flexDirection: 'row', gap: SPACING.xxs },
  tab: {
    height: 40,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  tabActive: { backgroundColor: COLORS.secondaryBackground, borderColor: COLORS.secondaryBackground },
  tabLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.lightGreyText },
  tabLabelActive: { fontFamily: 'Poppins_600SemiBold', color: COLORS.headingText },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md },
  separator: { height: SPACING.md },
  card: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  cardTop: { flexDirection: 'row', gap: SPACING.md },
  photoCol: { gap: SPACING.xxs },
  mainPhoto: {
    width: 68,
    height: 68,
    borderRadius: RADII.xs,
    overflow: 'hidden',
  },
  mainPhotoImg: { width: 68, height: 68 },
  photoPlaceholder: { backgroundColor: COLORS.layer1Background, alignItems: 'center', justifyContent: 'center' },
  thumbRow: { flexDirection: 'row', gap: SPACING.xxs },
  thumb: { width: 32, height: 32, borderRadius: RADII.xs, overflow: 'hidden' },
  thumbImg: { width: 32, height: 32 },
  extraThumb: {
    backgroundColor: COLORS.layer2Background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraThumbText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.paragraphText },
  infoCol: { flex: 1, gap: SPACING.xs },
  statusLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.paragraphText },
  infoRows: { gap: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, height: 22 },
  infoKey: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.paragraphText, flexShrink: 0 },
  infoVal: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  totalVal: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.headingText,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.headingText },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
