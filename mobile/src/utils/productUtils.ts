import { Product } from '../types';

/**
 * Check if a product is available for purchase
 * @param product - The product to check
 * @returns boolean - true if product is available, false otherwise
 */
export const isProductAvailable = (product: Product): boolean => {
  // Check if product is active and visible
  if (product.status !== 'active' || !product.isVisible) {
    return false;
  }

  // If inventory tracking is disabled, product is available
  if (!product.inventory?.trackQuantity) {
    return true;
  }

  // Check if there's stock available or backorder is allowed
  const availableQuantity = (product.inventory.quantity || 0) - (product.inventory.reservedQuantity || 0);
  return availableQuantity > 0 || product.inventory.allowBackorder === true;
};

/**
 * Get the available quantity for a product
 * @param product - The product to check
 * @returns number - available quantity, or null if not tracked
 */
export const getAvailableQuantity = (product: Product): number | null => {
  if (!product.inventory?.trackQuantity) {
    return null;
  }

  return Math.max(0, (product.inventory.quantity || 0) - (product.inventory.reservedQuantity || 0));
};

/**
 * Check if a product is low in stock
 * @param product - The product to check
 * @returns boolean - true if product is low in stock
 */
export const isProductLowStock = (product: Product): boolean => {
  if (!product.inventory?.trackQuantity) {
    return false;
  }

  const availableQuantity = getAvailableQuantity(product);
  const threshold = product.inventory.lowStockThreshold || 5;
  
  return availableQuantity !== null && availableQuantity <= threshold;
};

/**
 * Get stock status text for display
 * @param product - The product to check
 * @returns string - stock status text
 */
export const getStockStatusText = (product: Product): string => {
  if (!isProductAvailable(product)) {
    return 'Out of Stock';
  }

  if (isProductLowStock(product)) {
    return 'Low Stock';
  }

  return 'In Stock';
};

/**
 * Get the primary image URL for a product
 * @param product - The product to get image for
 * @returns string - image URL or empty string if no image
 */
export const getProductImageUrl = (product: Product): string => {
  if (!product.images || product.images.length === 0) {
    return '';
  }

  // Find primary image first
  const primaryImage = product.images.find(img => img.isPrimary);
  if (primaryImage) {
    return primaryImage.url;
  }

  // Fall back to first image
  return product.images[0]?.url || '';
};

/**
 * Format product price with currency
 * @param price - The price to format
 * @param currency - The currency code (default: NGN)
 * @returns string - formatted price
 */
export const formatProductPrice = (price: number, currency: string = 'NGN'): string => {
  if (currency === 'NGN') {
    return `₦${price.toLocaleString()}`;
  }
  
  return `${currency} ${price.toLocaleString()}`;
};

/**
 * Calculate discount percentage
 * @param originalPrice - The original price
 * @param salePrice - The sale price
 * @returns number - discount percentage
 */
export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= salePrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
