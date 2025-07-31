/**
 * Shop Listing Screen - Display Mcan products
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { isProductAvailable, formatProductPrice, calculateDiscountPercentage } from '../../utils/productUtils';



const ShopListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addItem, totalItems } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All', icon: 'grid-outline' }
  ]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.PRODUCTS}`);
      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        Alert.alert('Error', 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.PRODUCT_CATEGORIES}`);
      const data = await response.json();

      if (data.success && data.categories) {
        const apiCategories = data.categories.map((cat: any) => ({
          id: cat._id,
          name: cat.name,
          icon: 'storefront-outline'
        }));
        setCategories([
          { id: 'all', name: 'All', icon: 'grid-outline' },
          ...apiCategories
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(product =>
    selectedCategory === 'all' || product.category?._id === selectedCategory
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    try {
      addItem(product, 1);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails' as never, { product: item } as never)}
    >
      <View style={styles.imageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="cube-outline" size={32} color={COLORS.GRAY_400} />
        </View>
        {!isProductAvailable(item) && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        {item.comparePrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={1}>{item.description}</Text>
        
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.WARNING} />
          <Text style={styles.ratingText}>4.5</Text>
          <Text style={styles.reviewsText}>(0)</Text>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
            {item.comparePrice && (
              <Text style={styles.originalPrice}>₦{item.comparePrice.toLocaleString()}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, !item.isActive && styles.addButtonDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={!item.isActive}
          >
            <Ionicons
              name={item.isActive ? "add" : "close"}
              size={16}
              color={item.isActive ? COLORS.WHITE : COLORS.GRAY_500}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mcan Shop</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('ShoppingCart' as never)}
        >
          <Ionicons name="bag-outline" size={24} color={COLORS.WHITE} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? COLORS.WHITE : COLORS.GRAY_600} 
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={64} color={COLORS.GRAY_400} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting a different category
              </Text>
            </View>
          }
        />
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
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.WHITE,
  },
  cartButton: {
    position: 'relative',
    padding: SPACING.SM,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.WHITE,
  },
  categoriesContainer: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.LG,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.MD,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_100,
    gap: SPACING.XS,
  },
  categoryTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.GRAY_600,
  },
  categoryTabTextActive: {
    color: COLORS.WHITE,
  },
  listContainer: {
    padding: SPACING.LG,
    paddingBottom: 80, // Reduced space for tab bar
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: SPACING.LG,
    overflow: 'hidden',
    width: '48%',
    ...SHADOWS.SM,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: SPACING.SM,
    left: SPACING.SM,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  cardContent: {
    padding: SPACING.MD,
  },
  productName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  productDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    gap: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  reviewsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ShopListingScreen;
