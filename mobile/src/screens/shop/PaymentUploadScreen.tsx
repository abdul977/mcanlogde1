/**
 * Payment Screenshot Upload Screen
 * Allows users to upload payment proof for bank transfer orders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen, ValidatedInput, AnimatedButton, BankTransferDetails } from '../../components';
import { useAuth } from '../../context';
import { paymentConfigService, PaymentConfiguration } from '../../services/api';
import apiClient from '../../services/api/apiClient';

interface PaymentUploadRouteParams {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
}

const PaymentUploadScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { orderId, orderNumber, totalAmount } = (route.params as PaymentUploadRouteParams) || {};

  const [formData, setFormData] = useState({
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0], // Today's date
    userNotes: '',
  });

  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    type: string;
    name: string;
    size: number;
  } | null>(null);


  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload payment screenshots.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `payment_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take payment screenshots.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `payment_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Payment Screenshot',
      'Choose how you want to add your payment screenshot',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadPaymentProof = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a payment screenshot');
      return;
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (selectedImage.size && selectedImage.size > maxFileSize) {
      Alert.alert(
        'File Too Large',
        'File size must be less than 10MB. Please select a smaller image.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (selectedImage.type && !allowedTypes.includes(selectedImage.type)) {
      Alert.alert(
        'Invalid File Type',
        'Please select an image file (JPEG, PNG, or GIF).',
        [{ text: 'OK' }]
      );
      return;
    }


    // Transaction reference is now optional - no validation required

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('orderId', orderId);
      formDataToSend.append('amount', totalAmount.toString());
      formDataToSend.append('paymentMethod', 'bank_transfer');
      formDataToSend.append('transactionReference', formData.transactionReference);
      formDataToSend.append('paymentDate', formData.paymentDate);
      formDataToSend.append('userNotes', formData.userNotes);
      
      // Append the image file with proper format for React Native
      formDataToSend.append('paymentScreenshot', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.name,
      } as any);

      const result = await apiClient.post(
        '/api/payments/submit-proof',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for file uploads
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      if (result.data?.success) {
        Alert.alert(
          'Success',
          'Payment proof uploaded successfully! We will verify your payment and update your order status.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ShopListing' as never),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.data?.message || 'Failed to upload payment proof');
      }
    } catch (error: any) {
      console.error('Error uploading payment proof:', error);

      let errorMessage = 'Failed to upload payment proof. Please try again.';
      let errorTitle = 'Upload Error';

      // Handle specific error types
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        switch (status) {
          case 400:
            errorTitle = 'Invalid Request';
            if (data?.message) {
              if (data.message.includes('file size')) {
                errorMessage = 'File size too large. Please select a smaller image (max 10MB).';
              } else if (data.message.includes('file type') || data.message.includes('Only image files')) {
                errorMessage = 'Invalid file type. Please select an image file (JPEG, PNG, GIF) or PDF.';
              } else if (data.message.includes('Missing required fields')) {
                errorMessage = 'Please fill in all required fields and try again.';
              } else if (data.message.includes('already exists')) {
                errorMessage = 'Payment verification already exists for this order.';
              } else {
                errorMessage = data.message;
              }
            }
            break;
          case 401:
            errorTitle = 'Authentication Error';
            errorMessage = 'Your session has expired. Please log in again.';
            break;
          case 404:
            errorTitle = 'Order Not Found';
            errorMessage = 'Order not found or access denied. Please check your order details.';
            break;
          case 413:
            errorTitle = 'File Too Large';
            errorMessage = 'File size too large. Please select a smaller image (max 10MB).';
            break;
          case 500:
            errorTitle = 'Server Error';
            if (data?.message?.includes('Upload failed')) {
              errorMessage = 'File upload failed. Please check your internet connection and try again.';
            } else {
              errorMessage = 'Server error occurred. Please try again later.';
            }
            break;
          default:
            errorMessage = data?.message || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        errorTitle = 'Upload Timeout';
        errorMessage = 'Upload is taking too long. Please check your internet connection and try again.';
      } else if (error.message) {
        // Other errors with message
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage, [
        { text: 'OK', style: 'default' }
      ]);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
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
        <Text style={styles.headerTitle}>Upload Payment Proof</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoTitle}>Order Details</Text>
          <Text style={styles.orderInfoText}>Order: {orderNumber}</Text>
          <Text style={styles.orderInfoText}>Amount: ₦{totalAmount?.toLocaleString()}</Text>
        </View>

        {/* Dynamic Bank Transfer Details */}
        <BankTransferDetails
          showCopyButtons={true}
          showInstructions={false}
          containerStyle={styles.bankTransferContainer}
          onError={(error) => {
            console.error('Bank details error:', error);
            Alert.alert(
              'Configuration Error',
              'Failed to load payment details. Please try again later.',
              [{ text: 'OK' }]
            );
          }}
        />

        {/* Payment Screenshot Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Payment Screenshot</Text>
          <Text style={styles.sectionDescription}>
            Upload a screenshot of your payment confirmation
          </Text>

          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.ERROR} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={showImagePickerOptions}>
              <Ionicons name="camera-outline" size={32} color={COLORS.PRIMARY} />
              <Text style={styles.uploadButtonText}>Tap to upload screenshot</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction Details */}
        <View style={styles.formSection}>
          <ValidatedInput
            label="Transaction Reference (Optional)"
            value={formData.transactionReference}
            onChangeText={(text) => setFormData(prev => ({ ...prev, transactionReference: text }))}
            placeholder="Enter transaction reference number (optional)"
          />

          <ValidatedInput
            label="Payment Date"
            value={formData.paymentDate}
            onChangeText={(text) => setFormData(prev => ({ ...prev, paymentDate: text }))}
            placeholder="YYYY-MM-DD"
            required
          />

          <ValidatedInput
            label="Additional Notes (Optional)"
            value={formData.userNotes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, userNotes: text }))}
            placeholder="Any additional information about the payment"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Upload Progress */}
        {isLoading && (
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.progressText}>
                {uploadProgress > 0
                  ? `Uploading payment proof... ${uploadProgress}%`
                  : 'Preparing upload...'
                }
              </Text>
            </View>
            {uploadProgress > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${uploadProgress}%` }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <AnimatedButton
            title="Submit Payment Proof"
            onPress={uploadPaymentProof}
            variant="primary"
            size="large"
            loading={isLoading}
            leftIcon="checkmark-outline"
          />
        </View>
      </ScrollView>
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
    padding: SPACING.XS,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  headerRight: {
    width: 40, // Same as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  orderInfo: {
    backgroundColor: COLORS.WHITE,
    margin: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  orderInfoTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  orderInfoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  bankTransferContainer: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
    marginVertical: 0,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  uploadSection: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY + '10',
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.PRIMARY,
    marginTop: SPACING.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: 60,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
  },
  formSection: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.MD,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SM,
  },
  submitContainer: {
    margin: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  progressSection: {
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.MD,
  },
  progressBarContainer: {
    marginTop: SPACING.SM,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.GRAY_200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
});

export default PaymentUploadScreen;
