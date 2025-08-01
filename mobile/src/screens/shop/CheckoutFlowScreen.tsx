/**
 * Checkout Flow Screen - Multi-step checkout process
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen, ValidatedInput, AnimatedButton, BankTransferDetails } from '../../components';
import { useAuth, useCart, useProfileStats } from '../../context';
import { formatPrice, calculateShipping, calculatePriceBreakdown } from '../../utils/priceUtils';

const CheckoutFlowScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const { incrementOrderCount } = useProfileStats();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const steps = useMemo(() => [
    { id: 1, title: 'Shipping', icon: 'location-outline' },
    { id: 2, title: 'Payment', icon: 'card-outline' },
    { id: 3, title: 'Review', icon: 'checkmark-circle-outline' },
  ], []);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    paymentMethod: 'bank_transfer', // Default to bank transfer
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user?.name || user?.phone) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user?.name, user?.phone]);

  // Memoized form handlers
  const handleFullNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, fullName: text }));
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, phone: text }));
  }, []);

  const handleAddressChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, address: text }));
  }, []);

  const handleCityChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, city: text }));
  }, []);

  const handleStateChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, state: text }));
  }, []);

  const handlePaymentMethodChange = useCallback((method: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handlePlaceOrder = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.paymentMethod) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      if (!items.length) {
        Alert.alert('Error', 'Your cart is empty.');
        return;
      }

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: user?.email || '',
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: '000000', // Default postal code
          country: 'Nigeria',
        },
        paymentMethod: formData.paymentMethod,
        customerNotes: '',
        shippingMethod: 'standard',
      };

      // Submit order to API
      console.log('📦 Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      const data = await response.json();
      console.log('📡 Response data:', JSON.stringify(data, null, 2));

      if (data.success) {
        // Increment order count immediately for UI feedback
        incrementOrderCount();

        // Clear cart
        clearCart();

        Alert.alert(
          'Order Placed!',
          `Your order #${data.order.orderNumber} has been placed successfully. Please upload your payment proof to complete the process.`,
          [
            {
              text: 'Upload Payment Proof',
              onPress: () => {
                navigation.navigate('PaymentUpload' as never, {
                  orderId: data.order._id,
                  orderNumber: data.order.orderNumber,
                  totalAmount: totalAmount,
                } as never);
              },
            },
            {
              text: 'Later',
              style: 'cancel',
              onPress: () => navigation.navigate('ShopListing' as never),
            },
          ]
        );
      } else {
        // Show the actual server error message
        const errorMessage = data.message || data.error || 'Failed to place order';
        console.error('Server error:', errorMessage);
        Alert.alert('Order Error', errorMessage);
        return;
      }
    } catch (error) {
      console.error('Order creation error:', error);

      // Show more detailed error information
      let errorMessage = 'Failed to place order. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, user, items, totalAmount, token, incrementOrderCount, clearCart, navigation]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Shipping Information</Text>
            <Text style={styles.stepDescription}>
              Please provide your shipping details
            </Text>
            {(user?.name || user?.phone) && (
              <View style={styles.profileInfoBanner}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                <Text style={styles.profileInfoText}>
                  Some fields are pre-filled from your profile
                </Text>
              </View>
            )}

            <ValidatedInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={handleFullNameChange}
              leftIcon="person-outline"
              required
            />

            <ValidatedInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={handlePhoneChange}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              required
            />

            <ValidatedInput
              label="Address"
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={handleAddressChange}
              leftIcon="location-outline"
              multiline
              numberOfLines={2}
              required
            />

            <ValidatedInput
              label="City"
              placeholder="Enter your city"
              value={formData.city}
              onChangeText={handleCityChange}
              leftIcon="business-outline"
              required
            />

            <ValidatedInput
              label="State"
              placeholder="Enter your state"
              value={formData.state}
              onChangeText={handleStateChange}
              leftIcon="map-outline"
              required
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Text style={styles.stepDescription}>
              Choose your preferred payment method
            </Text>

            <View style={styles.paymentOptions}>
              {/* Only Bank Transfer option available */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  styles.paymentOptionSelected // Always selected since it's the only option
                ]}
                onPress={() => handlePaymentMethodChange('bank_transfer')}
              >
                <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Bank Transfer</Text>
                  <Text style={styles.paymentSubtitle}>Secure payment via bank transfer</Text>
                </View>
                <Ionicons
                  name="radio-button-on"
                  size={20}
                  color={COLORS.PRIMARY}
                />
              </TouchableOpacity>

              {/* Dynamic Bank Transfer Details */}
              <BankTransferDetails
                showCopyButtons={true}
                showInstructions={true}
                customInstructions={
                  '1. Transfer the exact order amount to the bank details above\n' +
                  '2. Use your order number as the transfer description\n' +
                  '3. Upload your payment receipt after placing the order\n' +
                  '4. Your order will be processed once payment is verified'
                }
                containerStyle={styles.bankTransferContainer}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Order</Text>
            <Text style={styles.stepDescription}>
              Please review your order details before placing
            </Text>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Shipping Address</Text>
              <Text style={styles.reviewText}>{formData.fullName}</Text>
              <Text style={styles.reviewText}>{formData.phone}</Text>
              <Text style={styles.reviewText}>{formData.address}</Text>
              <Text style={styles.reviewText}>{formData.city}, {formData.state}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Payment Method</Text>
              <Text style={styles.reviewText}>Bank Transfer</Text>
              <Text style={styles.reviewSubtext}>
                You will receive bank details after placing your order
              </Text>
            </View>

            <View style={styles.orderSummary}>
              <Text style={styles.reviewSectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>{formatPrice(calculateShipping(totalAmount))}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatPrice(totalAmount + calculateShipping(totalAmount))}</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaScreen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                currentStep >= step.id && styles.progressCircleActive,
                currentStep > step.id && styles.progressCircleCompleted,
              ]}>
                <Ionicons
                  name={currentStep > step.id ? "checkmark" : step.icon as any}
                  size={16}
                  color={currentStep >= step.id ? COLORS.WHITE : COLORS.GRAY_400}
                />
              </View>
              <Text style={[
                styles.progressLabel,
                currentStep >= step.id && styles.progressLabelActive,
              ]}>
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View style={[
                  styles.progressLine,
                  currentStep > step.id && styles.progressLineCompleted,
                ]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.nextButtonContainer}>
          {currentStep < steps.length ? (
            <AnimatedButton
              title="Next"
              onPress={handleNext}
              variant="primary"
              size="medium"
              rightIcon="arrow-forward"
            />
          ) : (
            <AnimatedButton
              title="Place Order"
              onPress={handlePlaceOrder}
              variant="primary"
              size="medium"
              loading={isLoading}
              leftIcon="checkmark-outline"
            />
          )}
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: SPACING.XL, // Extra padding to ensure content is not hidden
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    backgroundColor: COLORS.WHITE,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.GRAY_300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  progressCircleActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  progressCircleCompleted: {
    backgroundColor: COLORS.SUCCESS,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.GRAY_300,
    zIndex: -1,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.SUCCESS,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: SPACING.LG,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
  },
  paymentOptions: {
    gap: SPACING.MD,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.GRAY_200,
    ...SHADOWS.SM,
  },
  paymentOptionSelected: {
    borderColor: COLORS.PRIMARY,
  },
  paymentText: {
    flex: 1,
    marginLeft: SPACING.MD,
  },
  paymentTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  reviewSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  reviewSectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  reviewText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  reviewSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  orderSummary: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    paddingBottom: SPACING.XL, // Extra bottom padding to avoid tab bar
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    ...SHADOWS.SM,
  },
  previousButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  previousButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: SPACING.LG,
  },
  profileInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS + '10',
    borderRadius: 8,
    padding: SPACING.SM,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SUCCESS + '30',
  },
  profileInfoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.SUCCESS,
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  bankTransferContainer: {
    marginTop: SPACING.MD,
    marginHorizontal: 0,
  },
});

export default React.memo(CheckoutFlowScreen);
