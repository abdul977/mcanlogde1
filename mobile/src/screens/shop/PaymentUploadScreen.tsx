/**
 * Payment Screenshot Upload Screen
 * Allows users to upload payment proof for bank transfer orders
 */

import React, { useState } from 'react';
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

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG } from '../../constants';
import { SafeAreaScreen, ValidatedInput, AnimatedButton } from '../../components';
import { useAuth } from '../../context';

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    if (!formData.transactionReference.trim()) {
      Alert.alert('Error', 'Please enter the transaction reference');
      return;
    }

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
      
      // Append the image file
      formDataToSend.append('paymentScreenshot', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.name,
      } as any);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/payments/submit-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
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
        Alert.alert('Error', result.message || 'Failed to upload payment proof');
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      Alert.alert('Error', 'Failed to upload payment proof. Please try again.');
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

        {/* Bank Details */}
        <View style={styles.bankDetails}>
          <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
          <View style={styles.bankInfo}>
            <Text style={styles.bankLabel}>Bank Name:</Text>
            <Text style={styles.bankValue}>First Bank Nigeria</Text>
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.bankLabel}>Account Name:</Text>
            <Text style={styles.bankValue}>MCAN Nigeria</Text>
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.bankLabel}>Account Number:</Text>
            <Text style={styles.bankValue}>2034567890</Text>
          </View>
        </View>

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
            label="Transaction Reference"
            value={formData.transactionReference}
            onChangeText={(text) => setFormData(prev => ({ ...prev, transactionReference: text }))}
            placeholder="Enter transaction reference number"
            required
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
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.progressText}>Uploading payment proof...</Text>
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
  bankDetails: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
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
  bankInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  bankLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  bankValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
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
});

export default PaymentUploadScreen;
