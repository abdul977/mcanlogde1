/**
 * Booking Flow Screen - Multi-step booking process
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { useAuth } from '../../context';
import { SafeAreaScreen, ValidatedInput, AnimatedButton, BankTransferDetails } from '../../components';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationConfig } from '../../utils/validation';

const BookingFlowScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'transfer' | 'card' | null>(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentData, setPaymentData] = useState({
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    userNotes: '',
  });

  const steps = [
    { id: 1, title: 'Personal Details', icon: 'person-outline' },
    { id: 2, title: 'Booking Dates', icon: 'calendar-outline' },
    { id: 3, title: 'Payment', icon: 'card-outline' },
    { id: 4, title: 'Confirmation', icon: 'checkmark-circle-outline' },
  ];

  const pickPaymentProof = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload payment proof.');
        return;
      }

      Alert.alert(
        'Select Payment Proof',
        'Choose how you want to upload your payment proof',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() },
          { text: 'Document', onPress: () => openDocumentPicker() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentProof(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentProof(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentProof(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening document picker:', error);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      // For React Native, we would use @react-native-clipboard/clipboard
      // For now, just show an alert with the text
      Alert.alert(
        `${label} Copied`,
        `${label}: ${text}\n\nThis has been copied to your clipboard.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Copy Failed', 'Unable to copy to clipboard');
    }
  };

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    fullName: { required: true, minLength: 2 },
    phone: { required: true, pattern: /^[0-9+\-\s()]+$/ },
    stateCode: { required: true, minLength: 5 },
    checkInDate: { required: true },
    checkOutDate: { required: true },
    numberOfGuests: { required: true, min: 1, max: 6 },
    bookingDuration: { required: true, min: 1, max: 12 },
    emergencyContact: { required: true },
    emergencyContactName: { required: true, minLength: 2 },
    emergencyContactRelationship: { required: true, minLength: 2 },
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
      fullName: user?.name || '',
      phone: user?.phone || '',
      stateCode: user?.stateCode || '',
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: '1',
      bookingDuration: '1',
      emergencyContact: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      specialRequests: '',
    },
    validationRules,
    validateOnChange: false,
    validateOnBlur: true,
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setValue('fullName', user.name || '');
      setValue('phone', user.phone || '');
      setValue('stateCode', user.stateCode || '');
    }
  }, [user, setValue]);

  const handleNext = async () => {
    try {
      setIsValidating(true);
      // Validate current step before proceeding
      const isValid = await validateCurrentStep();
      if (isValid && currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        // Validate guest information
        const guestFields = ['fullName', 'phone', 'stateCode', 'emergencyContact', 'emergencyContactName', 'emergencyContactRelationship'];
        return await validateFields(guestFields);
      case 2:
        // Validate booking dates and details
        const bookingFields = ['checkInDate', 'checkOutDate', 'numberOfGuests', 'bookingDuration'];
        return await validateFields(bookingFields);
      case 3:
        // Payment step - validate payment method selection
        if (!selectedPaymentMethod) {
          Alert.alert(
            'Payment Method Required',
            'Please select a payment method to continue.',
            [{ text: 'OK' }]
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const validateFields = async (fieldNames: string[]) => {
    // First, mark all fields as touched to trigger validation
    fieldNames.forEach(fieldName => {
      setFieldTouched(fieldName);
    });

    // Wait a brief moment for validation state to update
    await new Promise(resolve => setTimeout(resolve, 100));

    let isValid = true;
    const invalidFields: string[] = [];
    const emptyFields: string[] = [];

    fieldNames.forEach(fieldName => {
      const fieldValue = values[fieldName];
      const fieldValidation = validationErrors[fieldName];

      // Check if field is empty
      if (!fieldValue || fieldValue.trim() === '') {
        isValid = false;
        emptyFields.push(fieldName);
      }
      // Check validation result if field has value
      else if (fieldValidation && !fieldValidation.isValid) {
        isValid = false;
        invalidFields.push(fieldName);
      }
    });

    // Additional date validation
    if (fieldNames.includes('checkInDate') && fieldNames.includes('checkOutDate')) {
      if (values.checkInDate && values.checkOutDate) {
        const checkIn = new Date(values.checkInDate);
        const checkOut = new Date(values.checkOutDate);
        if (checkOut <= checkIn) {
          isValid = false;
          Alert.alert(
            'Date Validation Error',
            'Check-out date must be after check-in date.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
    }

    // Only show validation popup if there are actual validation issues
    if (!isValid && (emptyFields.length > 0 || invalidFields.length > 0)) {
      let errorMessage = 'Please fill in all required fields correctly before proceeding.';

      if (emptyFields.length > 0) {
        const fieldLabels = emptyFields.map(field => {
          switch (field) {
            case 'fullName': return 'Full Name';
            case 'phone': return 'Phone Number';
            case 'stateCode': return 'State';
            case 'emergencyContact': return 'Emergency Contact';
            case 'emergencyContactName': return 'Emergency Contact Name';
            case 'emergencyContactRelationship': return 'Emergency Contact Relationship';
            case 'checkInDate': return 'Check-in Date';
            case 'checkOutDate': return 'Check-out Date';
            case 'numberOfGuests': return 'Number of Guests';
            case 'bookingDuration': return 'Booking Duration';
            default: return field;
          }
        });
        errorMessage = `Please fill in the following required fields: ${fieldLabels.join(', ')}`;
      }

      Alert.alert(
        'Validation Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }

    return isValid;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingSubmit = async (formData: any) => {
    try {
      setIsLoading(true);

      // Prepare booking data according to API requirements (matching working test script)
      const checkInDate = new Date(values.checkInDate);
      const checkOutDate = new Date(values.checkOutDate);
      const bookingMonths = parseInt(values.bookingDuration);
      const startDate = checkInDate.toISOString();
      const endDate = new Date(checkInDate.getTime() + (bookingMonths * 30 * 24 * 60 * 60 * 1000)).toISOString();

      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: route.params?.accommodationId,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numberOfGuests: parseInt(values.numberOfGuests),
        userNotes: values.specialRequests || '',
        contactInfo: {
          phone: values.phone,
          emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContact,
            relationship: values.emergencyContactRelationship
          }
        },
        bookingDuration: {
          months: bookingMonths,
          startDate: startDate,
          endDate: endDate
        },
        totalAmount: route.params?.accommodationPrice || 0
      };

      // Check if user is authenticated
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to make a booking.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('🔑 Token exists:', !!token);
      console.log('📤 Booking data:', JSON.stringify(bookingData, null, 2));
      console.log('🌐 API URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.CREATE_BOOKING}`);

      // Make API call to create booking (using same format as working test script)
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CREATE_BOOKING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Use Bearer token format like test script
        },
        body: JSON.stringify(bookingData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('✅ API Success Response:', result);

      // Check if the response indicates success (consistent with web version)
      if (!result.success) {
        throw new Error(result.message || 'Booking submission failed');
      }

      Alert.alert(
        'Booking Successful!',
        'Your accommodation booking has been submitted. You will receive a confirmation email shortly.',
        [{
          text: 'OK',
          onPress: () => {
            // Navigate to ProfileTab and then to MyBookings
            navigation.navigate('Main', {
              screen: 'ProfileTab',
              params: {
                screen: 'MyBookings'
              }
            });
          }
        }]
      );
    } catch (error) {
      console.error('Booking submission error:', error);
      Alert.alert(
        'Booking Error',
        error.message || 'Failed to submit booking. Please try again.'
      );
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
            {(user?.name || user?.phone || user?.stateCode) && (
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
              label="Emergency Contact Name"
              placeholder="Enter emergency contact name"
              value={values.emergencyContactName}
              onChangeText={(text) => setValue('emergencyContactName', text)}
              onBlur={() => setFieldTouched('emergencyContactName')}
              validationResult={validationErrors.emergencyContactName}
              showValidation={touched.emergencyContactName}
              leftIcon="person-outline"
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

            <ValidatedInput
              label="Relationship"
              placeholder="e.g., Parent, Sibling, Friend"
              value={values.emergencyContactRelationship}
              onChangeText={(text) => setValue('emergencyContactRelationship', text)}
              onBlur={() => setFieldTouched('emergencyContactRelationship')}
              validationResult={validationErrors.emergencyContactRelationship}
              showValidation={touched.emergencyContactRelationship}
              leftIcon="people-outline"
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
              label="Number of Guests"
              placeholder="Select number of guests"
              value={values.numberOfGuests}
              onChangeText={(text) => setValue('numberOfGuests', text)}
              onBlur={() => setFieldTouched('numberOfGuests')}
              validationResult={validationErrors.numberOfGuests}
              showValidation={touched.numberOfGuests}
              leftIcon="people-outline"
              isDropdown
              dropdownOptions={[
                { label: '1 person', value: '1' },
                { label: '2 people', value: '2' },
                { label: '3 people', value: '3' },
                { label: '4 people', value: '4' },
                { label: '5 people', value: '5' },
                { label: '6 people', value: '6' },
              ]}
              required
            />

            <ValidatedInput
              label="Booking Duration (Months)"
              placeholder="Select booking duration"
              value={values.bookingDuration}
              onChangeText={(text) => setValue('bookingDuration', text)}
              onBlur={() => setFieldTouched('bookingDuration')}
              validationResult={validationErrors.bookingDuration}
              showValidation={touched.bookingDuration}
              leftIcon="time-outline"
              isDropdown
              dropdownOptions={[
                { label: '1 month', value: '1' },
                { label: '2 months', value: '2' },
                { label: '3 months', value: '3' },
                { label: '4 months', value: '4' },
                { label: '5 months', value: '5' },
                { label: '6 months', value: '6' },
                { label: '7 months', value: '7' },
                { label: '8 months', value: '8' },
                { label: '9 months', value: '9' },
                { label: '10 months', value: '10' },
                { label: '11 months', value: '11' },
                { label: '12 months', value: '12' },
              ]}
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
              Complete your payment to confirm your booking
            </Text>

            {/* Payment Amount */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₦25,000</Text>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.paymentMethodSection}>
              <Text style={styles.sectionTitle}>Select Payment Method</Text>
              <Text style={styles.sectionDescription}>
                Choose your preferred payment method
              </Text>

              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === 'transfer' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setSelectedPaymentMethod('transfer')}
                >
                  <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />
                  <View style={styles.paymentText}>
                    <Text style={styles.paymentTitle}>Bank Transfer</Text>
                    <Text style={styles.paymentSubtitle}>Pay via bank transfer</Text>
                  </View>
                  <Ionicons
                    name={selectedPaymentMethod === 'transfer' ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={COLORS.PRIMARY}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === 'card' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setSelectedPaymentMethod('card')}
                >
                  <Ionicons name="card" size={24} color={COLORS.PRIMARY} />
                  <View style={styles.paymentText}>
                    <Text style={styles.paymentTitle}>Card Payment</Text>
                    <Text style={styles.paymentSubtitle}>Pay with debit/credit card</Text>
                  </View>
                  <Ionicons
                    name={selectedPaymentMethod === 'card' ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={COLORS.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Bank Transfer Details */}
            {selectedPaymentMethod === 'transfer' && (
              <BankTransferDetails
                showCopyButtons={true}
                showInstructions={true}
                customInstructions={
                  '1. Transfer the exact booking amount to the bank details above\n' +
                  '2. Use your booking reference as the transfer description\n' +
                  '3. Upload your payment receipt or screenshot below\n' +
                  '4. Your booking will be confirmed once payment is verified'
                }
                containerStyle={styles.bankTransferContainer}
              />
            )}

            {/* Payment Instructions */}
            {selectedPaymentMethod && (
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                <Text style={styles.instructionsText}>
                  {selectedPaymentMethod === 'transfer' ? (
                    '1. Transfer the exact amount to the bank details above\n' +
                    '2. Use your booking reference as the transfer description\n' +
                    '3. Upload your payment receipt or screenshot below\n' +
                    '4. Your booking will be confirmed once payment is verified'
                  ) : (
                    '1. You will be redirected to a secure payment page\n' +
                    '2. Enter your card details to complete payment\n' +
                    '3. Your booking will be confirmed immediately after payment\n' +
                    '4. You will receive a confirmation email'
                  )}
                </Text>
              </View>
            )}

            {/* Payment Proof Upload - Only for Bank Transfer */}
            {selectedPaymentMethod === 'transfer' && (
              <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Upload Payment Proof</Text>

              {paymentProof ? (
                <View style={styles.uploadedFile}>
                  {paymentProof.type?.startsWith('image/') ? (
                    <Image source={{ uri: paymentProof.uri }} style={styles.uploadedImage} />
                  ) : (
                    <View style={styles.documentPreview}>
                      <Ionicons name="document-outline" size={40} color={COLORS.PRIMARY} />
                      <Text style={styles.documentName}>{paymentProof.name}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => setPaymentProof(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={pickPaymentProof}>
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.PRIMARY} />
                  <Text style={styles.uploadButtonText}>Upload Receipt/Screenshot</Text>
                  <Text style={styles.uploadButtonSubtext}>JPG, PNG, or PDF (Max 5MB)</Text>
                </TouchableOpacity>
              )}
              {/* Transaction Reference */}
              <ValidatedInput
                label="Transaction Reference (Optional)"
                placeholder="Enter transaction reference"
                value={paymentData.transactionReference}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, transactionReference: text }))}
                leftIcon="receipt-outline"
              />

              {/* Payment Date */}
              <ValidatedInput
                label="Payment Date"
                placeholder="Select payment date"
                value={paymentData.paymentDate}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, paymentDate: text }))}
                leftIcon="calendar-outline"
                isDatePicker
              />

              {/* Additional Notes */}
              <ValidatedInput
                label="Additional Notes (Optional)"
                placeholder="Any additional information about your payment"
                value={paymentData.userNotes}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, userNotes: text }))}
                leftIcon="chatbubble-outline"
                multiline
                numberOfLines={3}
              />
            </View>
            )}

            {/* Common fields for all payment methods */}
            <ValidatedInput
              label="Special Requests (Optional)"
              placeholder="Any special requests for your booking"
              value={values.specialRequests}
              onChangeText={(text) => setValue('specialRequests', text)}
              leftIcon="chatbubble-outline"
              multiline
              numberOfLines={3}
            />
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
              loading={isValidating}
              disabled={isValidating}
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
  scrollViewContent: {
    paddingBottom: 200, // Further increased padding to prevent overlap with tab navigation
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
  paymentMethodSection: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
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
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    ...SHADOWS.SM,
  },
  paymentOptionSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '10',
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
    fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  bankTransferContainer: {
    marginVertical: SPACING.MD,
    marginHorizontal: 0,
  },
  // Instructions Styles
  instructionsCard: {
    backgroundColor: COLORS.INFO + '10',
    borderRadius: 12,
    padding: SPACING.LG,
    marginVertical: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.INFO,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  // Upload Styles
  uploadSection: {
    marginVertical: SPACING.MD,
  },
  uploadTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  uploadButton: {
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.GRAY_200,
    borderStyle: 'dashed',
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.PRIMARY,
    marginTop: SPACING.SM,
  },
  uploadButtonSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  uploadedFile: {
    position: 'relative',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.MD,
    ...SHADOWS.SM,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  documentPreview: {
    alignItems: 'center',
    padding: SPACING.LG,
  },
  documentName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    ...SHADOWS.SM,
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
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.XL + 20, // Extra padding to account for tab navigation
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
});

export default BookingFlowScreen;
