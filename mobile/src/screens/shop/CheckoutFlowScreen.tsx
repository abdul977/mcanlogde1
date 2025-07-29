/**
 * Checkout Flow Screen - Multi-step checkout process
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
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen, ValidatedInput, AnimatedButton } from '../../components';

const CheckoutFlowScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Shipping', icon: 'location-outline' },
    { id: 2, title: 'Payment', icon: 'card-outline' },
    { id: 3, title: 'Review', icon: 'checkmark-circle-outline' },
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentMethod: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      // TODO: Submit order to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. You will receive a confirmation email shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('OrderHistory' as never) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Shipping Information</Text>
            <Text style={styles.stepDescription}>
              Please provide your shipping details
            </Text>

            <ValidatedInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              leftIcon="person-outline"
              required
            />

            <ValidatedInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              required
            />

            <ValidatedInput
              label="Address"
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              leftIcon="location-outline"
              multiline
              numberOfLines={2}
              required
            />

            <ValidatedInput
              label="City"
              placeholder="Enter your city"
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              leftIcon="business-outline"
              required
            />

            <ValidatedInput
              label="State"
              placeholder="Enter your state"
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
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
              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  formData.paymentMethod === 'transfer' && styles.paymentOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer' }))}
              >
                <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Bank Transfer</Text>
                  <Text style={styles.paymentSubtitle}>Pay via bank transfer</Text>
                </View>
                <Ionicons 
                  name={formData.paymentMethod === 'transfer' ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={COLORS.PRIMARY} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  formData.paymentMethod === 'card' && styles.paymentOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
              >
                <Ionicons name="card" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Card Payment</Text>
                  <Text style={styles.paymentSubtitle}>Pay with debit/credit card</Text>
                </View>
                <Ionicons 
                  name={formData.paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={COLORS.PRIMARY} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  formData.paymentMethod === 'delivery' && styles.paymentOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, paymentMethod: 'delivery' }))}
              >
                <Ionicons name="cash-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Pay on Delivery</Text>
                  <Text style={styles.paymentSubtitle}>Pay when you receive your order</Text>
                </View>
                <Ionicons 
                  name={formData.paymentMethod === 'delivery' ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={COLORS.PRIMARY} 
                />
              </TouchableOpacity>
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
              <Text style={styles.reviewText}>
                {formData.paymentMethod === 'transfer' && 'Bank Transfer'}
                {formData.paymentMethod === 'card' && 'Card Payment'}
                {formData.paymentMethod === 'delivery' && 'Pay on Delivery'}
              </Text>
            </View>

            <View style={styles.orderSummary}>
              <Text style={styles.reviewSectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₦23,000</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>₦2,000</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₦25,000</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
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
});

export default CheckoutFlowScreen;
