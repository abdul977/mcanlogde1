/**
 * Order History Screen - Display user's shop orders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import { useAuth } from '../../context';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  trackingNumber?: string;
  paymentStatus?: string;
  shippingAddress?: any;
}

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_ORDERS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
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

  // Get order tracking steps
  const getOrderSteps = (currentStatus: string) => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', icon: 'receipt-outline' },
      { key: 'processing', label: 'Processing', icon: 'time-outline' },
      { key: 'shipped', label: 'Shipped', icon: 'car-outline' },
      { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && currentStatus !== 'cancelled'
    }));
  };

  // Handle order actions
  const showOrderDetails = (order: Order) => {
    Alert.alert(
      'Order Details',
      `Order: ${order.orderNumber}\nStatus: ${order.status.toUpperCase()}\nTotal: ₦${order.totalAmount.toLocaleString()}\nDate: ${new Date(order.createdAt).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  const reorderItems = (order: Order) => {
    Alert.alert(
      'Reorder Items',
      'Add these items to your cart again?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', onPress: () => {
          // TODO: Implement reorder functionality
          Alert.alert('Success', 'Items added to cart!');
        }}
      ]
    );
  };

  const trackOrder = (order: Order) => {
    Alert.alert(
      'Track Order',
      `Tracking Number: ${order.trackingNumber}\n\nYour order is currently: ${order.status.toUpperCase()}`,
      [{ text: 'OK' }]
    );
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
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
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
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
                    <View key={`${order._id}-${index}`} style={styles.orderItem}>
                      <View style={styles.itemImage}>
                        <Ionicons name="cube-outline" size={20} color={COLORS.GRAY_400} />
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>
                          {item.productSnapshot?.name || item.product?.name || 'Product'}
                        </Text>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>₦{order.totalAmount.toLocaleString()}</Text>
                  </View>
                  
                  {order.trackingNumber && (
                    <View style={styles.trackingInfo}>
                      <Ionicons name="location-outline" size={14} color={COLORS.GRAY_600} />
                      <Text style={styles.trackingNumber}>Tracking: {order.trackingNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Order Progress Tracker */}
                <View style={styles.progressTracker}>
                  <View style={styles.progressSteps}>
                    {getOrderSteps(order.status).map((step, index) => (
                      <View key={step.key} style={styles.progressStep}>
                        <View style={[
                          styles.stepIndicator,
                          { backgroundColor: step.completed ? getStatusColor(order.status) : COLORS.GRAY_300 }
                        ]}>
                          <Ionicons
                            name={step.icon}
                            size={12}
                            color={step.completed ? COLORS.WHITE : COLORS.GRAY_500}
                          />
                        </View>
                        <Text style={[
                          styles.stepLabel,
                          { color: step.completed ? COLORS.TEXT_PRIMARY : COLORS.GRAY_500 }
                        ]}>
                          {step.label}
                        </Text>
                        {index < getOrderSteps(order.status).length - 1 && (
                          <View style={[
                            styles.stepConnector,
                            { backgroundColor: step.completed ? getStatusColor(order.status) : COLORS.GRAY_300 }
                          ]} />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => showOrderDetails(order)}
                  >
                    <Ionicons name="eye-outline" size={16} color={COLORS.PRIMARY} />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>

                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => reorderItems(order)}
                    >
                      <Ionicons name="refresh-outline" size={16} color={COLORS.SUCCESS} />
                      <Text style={[styles.actionButtonText, { color: COLORS.SUCCESS }]}>Reorder</Text>
                    </TouchableOpacity>
                  )}

                  {order.trackingNumber && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => trackOrder(order)}
                    >
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
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  // Progress Tracker Styles
  progressTracker: {
    marginTop: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    textAlign: 'center',
  },
  stepConnector: {
    position: 'absolute',
    top: 12,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
});

export default OrderHistoryScreen;
