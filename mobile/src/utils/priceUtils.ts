/**
 * Price calculation and formatting utilities
 */

export interface PriceCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

/**
 * Format price with Nigerian Naira currency
 * @param amount - The amount to format
 * @param showCurrency - Whether to show currency symbol (default: true)
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, showCurrency: boolean = true): string => {
  // Ensure amount is a valid number
  const validAmount = isNaN(amount) || amount < 0 ? 0 : amount;
  
  // Format with thousands separator
  const formatted = validAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return showCurrency ? `₦${formatted}` : formatted;
};

/**
 * Calculate shipping cost based on subtotal
 * @param subtotal - The cart subtotal
 * @returns Shipping cost
 */
export const calculateShipping = (subtotal: number): number => {
  // Free shipping for orders over ₦50,000
  if (subtotal >= 50000) {
    return 0;
  }
  
  // Standard shipping rate
  return 2000;
};

/**
 * Calculate tax (VAT) based on subtotal
 * @param subtotal - The cart subtotal
 * @returns Tax amount (7.5% VAT)
 */
export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.075);
};

/**
 * Calculate discount amount
 * @param subtotal - The cart subtotal
 * @param discountPercentage - Discount percentage (0-100)
 * @param maxDiscount - Maximum discount amount (optional)
 * @returns Discount amount
 */
export const calculateDiscount = (
  subtotal: number, 
  discountPercentage: number = 0, 
  maxDiscount?: number
): number => {
  if (discountPercentage <= 0) return 0;
  
  const discount = Math.round(subtotal * (discountPercentage / 100));
  
  if (maxDiscount && discount > maxDiscount) {
    return maxDiscount;
  }
  
  return discount;
};

/**
 * Calculate complete price breakdown
 * @param subtotal - The cart subtotal
 * @param discountPercentage - Discount percentage (optional)
 * @param maxDiscount - Maximum discount amount (optional)
 * @param includeTax - Whether to include tax in calculation (default: false)
 * @returns Complete price calculation
 */
export const calculatePriceBreakdown = (
  subtotal: number,
  discountPercentage: number = 0,
  maxDiscount?: number,
  includeTax: boolean = false
): PriceCalculation => {
  const discount = calculateDiscount(subtotal, discountPercentage, maxDiscount);
  const discountedSubtotal = subtotal - discount;
  const shipping = calculateShipping(discountedSubtotal);
  const tax = includeTax ? calculateTax(discountedSubtotal) : 0;
  const total = discountedSubtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
  };
};

/**
 * Validate price input
 * @param price - Price to validate
 * @returns Validated price (minimum 0)
 */
export const validatePrice = (price: number): number => {
  return Math.max(0, isNaN(price) ? 0 : price);
};

/**
 * Calculate item total for cart items
 * @param price - Item price
 * @param quantity - Item quantity
 * @returns Total for the item
 */
export const calculateItemTotal = (price: number, quantity: number): number => {
  const validPrice = validatePrice(price);
  const validQuantity = Math.max(1, isNaN(quantity) ? 1 : quantity);
  
  return validPrice * validQuantity;
};

/**
 * Parse price from string (removes currency symbols and formatting)
 * @param priceString - Price string to parse
 * @returns Parsed price number
 */
export const parsePrice = (priceString: string): number => {
  if (typeof priceString !== 'string') return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = priceString.replace(/[₦$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Check if shipping is free for the given subtotal
 * @param subtotal - The cart subtotal
 * @returns True if shipping is free
 */
export const isFreeShipping = (subtotal: number): boolean => {
  return subtotal >= 50000;
};

/**
 * Get shipping message based on subtotal
 * @param subtotal - The cart subtotal
 * @returns Shipping message
 */
export const getShippingMessage = (subtotal: number): string => {
  if (isFreeShipping(subtotal)) {
    return 'Free shipping';
  }
  
  const remaining = 50000 - subtotal;
  return `Add ${formatPrice(remaining)} more for free shipping`;
};
