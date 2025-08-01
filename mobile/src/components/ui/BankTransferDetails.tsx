/**
 * Dynamic Bank Transfer Details Component
 * 
 * A responsive, reusable component that fetches bank transfer information
 * from API endpoints and displays it with proper styling and overflow protection.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, SCREEN } from '../../constants';
import { paymentConfigService, BankDetails } from '../../services/api/paymentConfigService';

interface BankTransferDetailsProps {
  /** Show loading state while fetching data */
  showLoading?: boolean;
  /** Custom container style */
  containerStyle?: any;
  /** Show copy buttons for bank details */
  showCopyButtons?: boolean;
  /** Show payment instructions */
  showInstructions?: boolean;
  /** Custom instruction text */
  customInstructions?: string;
  /** Callback when data is loaded */
  onDataLoaded?: (bankDetails: BankDetails) => void;
  /** Callback when data loading fails */
  onError?: (error: string) => void;
}

const BankTransferDetails: React.FC<BankTransferDetailsProps> = ({
  showLoading = true,
  containerStyle,
  showCopyButtons = true,
  showInstructions = true,
  customInstructions,
  onDataLoaded,
  onError,
}) => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Update screen dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Fetch payment configuration on component mount
  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const paymentConfig = await paymentConfigService.getPaymentConfiguration();
      
      if (paymentConfig?.bankDetails) {
        const formattedDetails = paymentConfigService.formatBankDetails(paymentConfig.bankDetails);
        setBankDetails(formattedDetails);
        onDataLoaded?.(formattedDetails);
      } else {
        throw new Error('Bank details not available');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load bank details';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error fetching bank details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      // For React Native, we would use @react-native-clipboard/clipboard
      // For now, just show an alert with the text for copying
      Alert.alert(
        `${label} - Copy`,
        `${label}: ${text}\n\nPlease copy this information manually.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Copy Failed', 'Unable to copy to clipboard');
    }
  };

  const getResponsiveStyles = () => {
    const isSmallScreen = screenData.width < SCREEN.MOBILE_MAX;
    const isTablet = screenData.width >= SCREEN.TABLET_MIN && screenData.width <= SCREEN.TABLET_MAX;
    
    return {
      fontSize: isSmallScreen ? TYPOGRAPHY.FONT_SIZES.SM : TYPOGRAPHY.FONT_SIZES.BASE,
      padding: isSmallScreen ? SPACING.MD : SPACING.LG,
      maxWidth: isTablet ? '80%' : '100%',
    };
  };

  const responsiveStyles = getResponsiveStyles();

  // Loading state
  if (isLoading && showLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading bank details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, containerStyle]}>
        <Ionicons name="alert-circle-outline" size={32} color={COLORS.ERROR} />
        <Text style={styles.errorTitle}>Unable to Load Bank Details</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBankDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!bankDetails) {
    return (
      <View style={[styles.container, styles.errorContainer, containerStyle]}>
        <Ionicons name="information-circle-outline" size={32} color={COLORS.WARNING} />
        <Text style={styles.errorTitle}>Bank Details Unavailable</Text>
        <Text style={styles.errorText}>Bank transfer details are not configured yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, { maxWidth: responsiveStyles.maxWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="business-outline" size={24} color={COLORS.PRIMARY} />
        <Text style={[styles.title, { fontSize: responsiveStyles.fontSize + 2 }]}>
          Bank Transfer Details
        </Text>
      </View>

      {/* Bank Details */}
      <View style={[styles.detailsContainer, { padding: responsiveStyles.padding }]}>
        {/* Account Name */}
        <View style={styles.detailRow}>
          <Text style={[styles.label, { fontSize: responsiveStyles.fontSize - 2 }]}>
            Account Name:
          </Text>
          <View style={styles.valueContainer}>
            <Text 
              style={[styles.value, { fontSize: responsiveStyles.fontSize }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {bankDetails.accountName}
            </Text>
            {showCopyButtons && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(bankDetails.accountName, 'Account Name')}
              >
                <Ionicons name="copy-outline" size={16} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Number */}
        <View style={styles.detailRow}>
          <Text style={[styles.label, { fontSize: responsiveStyles.fontSize - 2 }]}>
            Account Number:
          </Text>
          <View style={styles.valueContainer}>
            <Text 
              style={[styles.value, styles.accountNumber, { fontSize: responsiveStyles.fontSize }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {bankDetails.accountNumber}
            </Text>
            {showCopyButtons && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
              >
                <Ionicons name="copy-outline" size={16} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bank Name */}
        <View style={styles.detailRow}>
          <Text style={[styles.label, { fontSize: responsiveStyles.fontSize - 2 }]}>
            Bank Name:
          </Text>
          <View style={styles.valueContainer}>
            <Text 
              style={[styles.value, { fontSize: responsiveStyles.fontSize }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {bankDetails.bankName}
            </Text>
            {showCopyButtons && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(bankDetails.bankName, 'Bank Name')}
              >
                <Ionicons name="copy-outline" size={16} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort Code (if available) */}
        {bankDetails.sortCode && bankDetails.sortCode !== 'N/A' && (
          <View style={styles.detailRow}>
            <Text style={[styles.label, { fontSize: responsiveStyles.fontSize - 2 }]}>
              Sort Code:
            </Text>
            <View style={styles.valueContainer}>
              <Text 
                style={[styles.value, { fontSize: responsiveStyles.fontSize }]}
                numberOfLines={1}
              >
                {bankDetails.sortCode}
              </Text>
              {showCopyButtons && (
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(bankDetails.sortCode!, 'Sort Code')}
                >
                  <Ionicons name="copy-outline" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Instructions */}
      {showInstructions && (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
            <Text style={[styles.instructionsTitle, { fontSize: responsiveStyles.fontSize }]}>
              Payment Instructions
            </Text>
          </View>
          <Text style={[styles.instructionsText, { fontSize: responsiveStyles.fontSize - 2 }]}>
            {customInstructions || 
              '1. Transfer the exact amount to the bank details above\n' +
              '2. Use your order/booking reference as the transfer description\n' +
              '3. Upload your payment receipt or screenshot\n' +
              '4. Your payment will be verified within 24 hours'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginVertical: SPACING.MD,
    ...SHADOWS.MD,
    overflow: 'hidden',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    minHeight: 120,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    minHeight: 120,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    marginTop: SPACING.MD,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.PRIMARY + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.PRIMARY + '20',
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  detailsContainer: {
    padding: SPACING.LG,
  },
  detailRow: {
    marginBottom: SPACING.MD,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 8,
    padding: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  value: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  accountNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  copyButton: {
    padding: SPACING.XS,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  instructionsContainer: {
    backgroundColor: COLORS.INFO + '10',
    borderTopWidth: 1,
    borderTopColor: COLORS.INFO + '20',
    padding: SPACING.LG,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.XS,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
});

export default BankTransferDetails;