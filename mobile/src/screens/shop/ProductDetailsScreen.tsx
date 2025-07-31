/**
 * Product Details Screen - Show detailed product information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen, AnimatedButton } from '../../components';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { isProductAvailable, getStockStatusText } from '../../utils/productUtils';

interface ProductDetailsRouteParams {
  product: Product;
}

const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  // Get product from route params or use default
  const { product } = (route.params as ProductDetailsRouteParams) || {
    product: {
      _id: '1',
      name: 'Sample Product',
      price: 0,
      description: 'Product description not available',
      status: 'active' as const,
      isVisible: true,
      sku: 'SAMPLE-001',
      category: { _id: '', name: '' },
      images: [],
      inventory: { quantity: 0, trackQuantity: true },
      currency: 'NGN',
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  const addToCart = () => {
    try {
      addItem(product, quantity);
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('ShoppingCart' as never) }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const tabs = [
    { id: 'description', title: 'Description' },
    { id: 'features', title: 'Features' },
    { id: 'specs', title: 'Specifications' },
    { id: 'reviews', title: 'Reviews' },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'description':
        return (
          <Text style={styles.tabContent}>{product.description}</Text>
        );
      case 'features':
        return (
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.featureText}>High-quality product</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.featureText}>Fast shipping</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.featureText}>Satisfaction guaranteed</Text>
            </View>
          </View>
        );
      case 'specs':
        return (
          <View style={styles.specsList}>
            <View style={styles.specItem}>
              <Text style={styles.specKey}>SKU:</Text>
              <Text style={styles.specValue}>{product.sku}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specKey}>Category:</Text>
              <Text style={styles.specValue}>{product.category?.name || 'N/A'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specKey}>Currency:</Text>
              <Text style={styles.specValue}>{product.currency || 'NGN'}</Text>
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsPlaceholder}>Reviews coming soon...</Text>
          </View>
        );
      default:
        return null;
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            <Ionicons name="book-outline" size={64} color={COLORS.GRAY_400} />
          </View>
          {product.comparePrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.WARNING} />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewsText}>(0 reviews)</Text>
            </View>
            <View style={styles.stockStatus}>
              <Ionicons
                name={isProductAvailable(product) ? "checkmark-circle" : "close-circle"}
                size={16}
                color={isProductAvailable(product) ? COLORS.SUCCESS : COLORS.ERROR}
              />
              <Text style={[
                styles.stockText,
                { color: isProductAvailable(product) ? COLORS.SUCCESS : COLORS.ERROR }
              ]}>
                {getStockStatusText(product)}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
              {product.comparePrice && (
                <Text style={styles.originalPrice}>₦{product.comparePrice.toLocaleString()}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.section}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.tabActive
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.tabTextActive
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tabContentContainer}>
            {renderTabContent()}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₦{(product.price * quantity).toLocaleString()}</Text>
        </View>
        <AnimatedButton
          title="Add to Cart"
          onPress={addToCart}
          variant="primary"
          size="large"
          leftIcon="bag-add-outline"
          disabled={!isProductAvailable(product)}
          style={styles.addToCartButton}
        />
      </View>
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
  shareButton: {
    padding: SPACING.SM,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: COLORS.WHITE,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_100,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
  },
  discountText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  productName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  reviewsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.SM,
  },
  price: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    textDecorationLine: 'line-through',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.LG,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    minWidth: 40,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
    marginBottom: SPACING.LG,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
  },
  tabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
  },
  tabContentContainer: {
    minHeight: 100,
  },
  tabContent: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  featuresList: {
    gap: SPACING.SM,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  featureText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  specsList: {
    gap: SPACING.SM,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specKey: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  specValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  reviewsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.LG,
  },
  reviewsPlaceholder: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  bottomSpacing: {
    height: 180, // Further increased space to prevent overlap with fixed button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    paddingBottom: SPACING.LG + 40, // Further increased safe area space
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    ...SHADOWS.LG,
    elevation: 15, // Higher elevation to ensure it stays above content on Android
    zIndex: 1000, // Ensure it stays above other content on iOS
    shadowOpacity: 0.3, // More prominent shadow
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
  },
  totalAmount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  addToCartButton: {
    width: '100%',
  },
});

export default ProductDetailsScreen;
