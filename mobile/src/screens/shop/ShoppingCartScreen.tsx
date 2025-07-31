/**
 * Shopping Cart Screen - Cart management
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen, AnimatedButton } from '../../components';
import { useCart } from '../../context/CartContext';
import { formatPrice, calculateShipping, getShippingMessage } from '../../utils/priceUtils';

const ShoppingCartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { items: cartItems, removeItem, updateQuantity, totalAmount, totalItems, isLoading } = useCart();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(productId)
        },
      ]
    );
  };

  const getSubtotal = () => {
    return totalAmount;
  };

  const getShipping = () => calculateShipping(totalAmount);
  const getTotal = () => getSubtotal() + getShipping();

  const proceedToCheckout = () => {
    navigation.navigate('CheckoutFlow' as never);
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerRight} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons name="bag-outline" size={64} color={COLORS.GRAY_400} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some products to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <View key={item.product._id} style={styles.cartItem}>
                  <View style={styles.itemImage}>
                    <Ionicons name="cube-outline" size={24} color={COLORS.GRAY_400} />
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.PRIMARY} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color={COLORS.PRIMARY} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <Text style={styles.itemTotal}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.product._id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>{formatPrice(getSubtotal())}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>{formatPrice(getShipping())}</Text>
              </View>

              {/* Free shipping message */}
              {getShipping() === 0 && (
                <Text style={styles.freeShippingText}>🎉 Free shipping applied!</Text>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatPrice(getTotal())}</Text>
              </View>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Fixed Checkout Button */}
          <View style={styles.checkoutContainer}>
            <AnimatedButton
              title={`Proceed to Checkout (${formatPrice(getTotal())})`}
              onPress={proceedToCheckout}
              variant="primary"
              size="large"
              rightIcon="arrow-forward"
            />
          </View>
        </>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
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
  scrollView: {
    flex: 1,
  },
  itemsContainer: {
    padding: SPACING.LG,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  itemImage: {
    width: 60,
    height: 60,
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
  },
  removeButton: {
    padding: SPACING.XS,
  },
  summaryContainer: {
    backgroundColor: COLORS.WHITE,
    margin: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
  },
  freeShippingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.SUCCESS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    textAlign: 'center',
    marginTop: SPACING.XS,
    marginBottom: SPACING.SM,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GRAY_200,
    marginVertical: SPACING.MD,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  bottomSpacing: {
    height: 80, // Reduced bottom spacing
  },
  checkoutContainer: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    paddingBottom: SPACING.LG + 30, // Increased safe area space to prevent cutoff
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    ...SHADOWS.LG,
  },
});

export default ShoppingCartScreen;
