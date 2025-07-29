/**
 * Order History Screen - Display user's shop orders
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
}

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-07-15',
      status: 'delivered',
      total: 15000,
      items: [
        { id: '1', name: 'Islamic Prayer Mat', quantity: 1, price: 8000 },
        { id: '2', name: 'Quran with Translation', quantity: 1, price: 7000 },
      ],
      trackingNumber: 'TRK123456789',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-07-20',
      status: 'shipped',
      total: 12000,
      items: [
        { id: '3', name: 'Tasbih Beads', quantity: 2, price: 6000 },
      ],
      trackingNumber: 'TRK987654321',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch orders from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return COLORS.SUCCESS;
      case 'shipped': return COLORS.INFO;
      case 'processing': return COLORS.WARNING;
      case 'pending': return COLORS.WARNING;
      case 'cancelled': return COLORS.ERROR;
      default: return COLORS.GRAY_500;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return 'checkmark-circle';
      case 'shipped': return 'car';
      case 'processing': return 'time';
      case 'pending': return 'hourglass';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={64} color={COLORS.GRAY_400} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start shopping for Islamic products
            </Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Browse Shop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(order.status) as any} 
                      size={14} 
                      color={getStatusColor(order.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <View key={item.id} style={styles.orderItem}>
                      <View style={styles.itemImage}>
                        <Ionicons name="cube-outline" size={20} color={COLORS.GRAY_400} />
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>₦{order.total.toLocaleString()}</Text>
                  </View>
                  
                  {order.trackingNumber && (
                    <View style={styles.trackingInfo}>
                      <Ionicons name="location-outline" size={14} color={COLORS.GRAY_600} />
                      <Text style={styles.trackingNumber}>Tracking: {order.trackingNumber}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="eye-outline" size={16} color={COLORS.PRIMARY} />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {order.status === 'delivered' && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="refresh-outline" size={16} color={COLORS.SUCCESS} />
                      <Text style={[styles.actionButtonText, { color: COLORS.SUCCESS }]}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                  
                  {order.trackingNumber && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="location-outline" size={16} color={COLORS.INFO} />
                      <Text style={[styles.actionButtonText, { color: COLORS.INFO }]}>Track</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  shopButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  ordersList: {
    padding: SPACING.LG,
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
  },
  orderItems: {
    marginBottom: SPACING.MD,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  itemImage: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  orderFooter: {
    marginBottom: SPACING.MD,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  totalAmount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  trackingNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.PRIMARY,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default OrderHistoryScreen;
