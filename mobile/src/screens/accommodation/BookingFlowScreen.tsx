/**
 * Booking Flow Screen - Multi-step booking process
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
import { SafeAreaScreen, ValidatedInput, AnimatedButton } from '../../components';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationConfig } from '../../utils/validation';

const BookingFlowScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Personal Details', icon: 'person-outline' },
    { id: 2, title: 'Booking Dates', icon: 'calendar-outline' },
    { id: 3, title: 'Payment', icon: 'card-outline' },
    { id: 4, title: 'Confirmation', icon: 'checkmark-circle-outline' },
  ];

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    fullName: { required: true, minLength: 2 },
    phone: { required: true, pattern: /^[0-9+\-\s()]+$/ },
    stateCode: { required: true, minLength: 5 },
    checkInDate: { required: true },
    checkOutDate: { required: true },
    emergencyContact: { required: true },
  };

  const {
    values,
    errors: validationErrors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      fullName: '',
      phone: '',
      stateCode: '',
      checkInDate: '',
      checkOutDate: '',
      emergencyContact: '',
      specialRequests: '',
    },
    validationRules,
    validateOnChange: false,
    validateOnBlur: true,
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

  const handleBookingSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      // TODO: Submit booking to API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Booking Successful!',
        'Your accommodation booking has been submitted. You will receive a confirmation email shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings' as never) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Details</Text>
            <Text style={styles.stepDescription}>
              Please provide your personal information for the booking
            </Text>

            <ValidatedInput
              label="Full Name"
              placeholder="Enter your full name"
              value={values.fullName}
              onChangeText={(text) => setValue('fullName', text)}
              onBlur={() => setFieldTouched('fullName')}
              validationResult={validationErrors.fullName}
              showValidation={touched.fullName}
              leftIcon="person-outline"
              required
            />

            <ValidatedInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={values.phone}
              onChangeText={(text) => setValue('phone', text)}
              onBlur={() => setFieldTouched('phone')}
              validationResult={validationErrors.phone}
              showValidation={touched.phone}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              required
            />

            <ValidatedInput
              label="NYSC State Code"
              placeholder="Enter your state code (e.g., FC/24A/1234)"
              value={values.stateCode}
              onChangeText={(text) => setValue('stateCode', text)}
              onBlur={() => setFieldTouched('stateCode')}
              validationResult={validationErrors.stateCode}
              showValidation={touched.stateCode}
              leftIcon="location-outline"
              autoCapitalize="characters"
              required
            />

            <ValidatedInput
              label="Emergency Contact"
              placeholder="Emergency contact number"
              value={values.emergencyContact}
              onChangeText={(text) => setValue('emergencyContact', text)}
              onBlur={() => setFieldTouched('emergencyContact')}
              validationResult={validationErrors.emergencyContact}
              showValidation={touched.emergencyContact}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              required
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Booking Dates</Text>
            <Text style={styles.stepDescription}>
              Select your check-in and check-out dates
            </Text>

            <ValidatedInput
              label="Check-in Date"
              placeholder="Select check-in date"
              value={values.checkInDate}
              onChangeText={(text) => setValue('checkInDate', text)}
              onBlur={() => setFieldTouched('checkInDate')}
              validationResult={validationErrors.checkInDate}
              showValidation={touched.checkInDate}
              leftIcon="calendar-outline"
              isDatePicker
              required
            />

            <ValidatedInput
              label="Check-out Date"
              placeholder="Select check-out date"
              value={values.checkOutDate}
              onChangeText={(text) => setValue('checkOutDate', text)}
              onBlur={() => setFieldTouched('checkOutDate')}
              validationResult={validationErrors.checkOutDate}
              showValidation={touched.checkOutDate}
              leftIcon="calendar-outline"
              isDatePicker
              required
            />

            <ValidatedInput
              label="Special Requests"
              placeholder="Any special requests or requirements"
              value={values.specialRequests}
              onChangeText={(text) => setValue('specialRequests', text)}
              leftIcon="chatbubble-outline"
              multiline
              numberOfLines={3}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>1 month</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValue}>₦25,000</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment</Text>
            <Text style={styles.stepDescription}>
              Choose your payment method
            </Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Bank Transfer</Text>
                  <Text style={styles.paymentSubtitle}>Pay via bank transfer</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="card" size={24} color={COLORS.PRIMARY} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>Card Payment</Text>
                  <Text style={styles.paymentSubtitle}>Pay with debit/credit card</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₦25,000</Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.confirmationIcon}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
            <Text style={styles.confirmationDescription}>
              Your accommodation booking has been successfully submitted. 
              You will receive a confirmation email with booking details.
            </Text>

            <View style={styles.bookingDetails}>
              <Text style={styles.detailsTitle}>Booking Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking ID:</Text>
                <Text style={styles.detailValue}>BK-2024-001</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Accommodation:</Text>
                <Text style={styles.detailValue}>MCAN Lodge - Male Block A</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Check-in:</Text>
                <Text style={styles.detailValue}>{values.checkInDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>₦25,000</Text>
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
        <Text style={styles.headerTitle}>Book Accommodation</Text>
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
              title="Complete Booking"
              onPress={() => handleSubmit(handleBookingSubmit)}
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
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginTop: SPACING.LG,
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  paymentOptions: {
    gap: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
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
  totalCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 12,
    padding: SPACING.LG,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  totalAmount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  confirmationIcon: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  confirmationTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  confirmationDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.LG,
  },
  bookingDetails: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
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

export default BookingFlowScreen;
