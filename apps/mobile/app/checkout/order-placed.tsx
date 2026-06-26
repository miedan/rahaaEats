import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getOrder } from '../../services/order.service';

export default function OrderPlacedScreen() {
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  if (isLoading || !order) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.iconPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Pressable
        style={[styles.closeButton, { top: insets.top + SPACING.xs }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Ionicons name="close" size={28} color={COLORS.headingText} />
      </Pressable>

      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={72} color={COLORS.iconPrimary} />
        <Text style={styles.title}>Yay! Your order{'\n'}has been placed.</Text>
        <Text style={styles.subtitle}>
          Your order would be delivered in the{'\n'}30 mins atmost
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="time-outline" size={20} color={COLORS.lightGreyText} />
              <Text style={styles.detailLabel}>Estimated time</Text>
            </View>
            <Text style={styles.detailValue}>30mins</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="location-outline" size={20} color={COLORS.lightGreyText} />
              <Text style={styles.detailLabel}>Deliver to</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {order.deliveryAddress?.label ?? 'Home'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="card-outline" size={20} color={COLORS.lightGreyText} />
              <Text style={styles.detailLabel}>Amount Paid</Text>
            </View>
            <Text style={styles.detailValue}>{order.totalRwf.toLocaleString('en-RW')} RWF</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <PrimaryButton title="Track my order" onPress={() => router.replace(`/order/${order.id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.elementBackground },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.elementBackground },
  closeButton: { position: 'absolute', left: SPACING.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xxl,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.headingText,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
    textAlign: 'center',
  },
  detailsCard: { width: '100%', gap: SPACING.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  detailLabel: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.lightGreyText },
  detailValue: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: COLORS.headingText, maxWidth: 160 },
  footer: { paddingHorizontal: SPACING.lg },
});
