/**
 * Enhanced Validated Form Container
 * 
 * This component provides a comprehensive form container with validation,
 * accessibility features, and submission handling.
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { ValidationResult } from '../../utils/validation';

// Form props
interface ValidatedFormProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  errors?: Record<string, ValidationResult>;
  isValid?: boolean;
  isSubmitting?: boolean;
  showSummaryErrors?: boolean;
  scrollEnabled?: boolean;
  keyboardAvoidingEnabled?: boolean;
  contentContainerStyle?: any;
  style?: any;
  onScroll?: (event: any) => void;
}

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  children,
  title,
  subtitle,
  errors = {},
  isValid = true,
  isSubmitting = false,
  showSummaryErrors = true,
  scrollEnabled = true,
  keyboardAvoidingEnabled = true,
  contentContainerStyle,
  style,
  onScroll,
}) => {
  // Get all form errors for summary
  const getAllErrors = (): string[] => {
    return Object.values(errors)
      .filter(result => !result.isValid)
      .flatMap(result => result.errors)
      .filter(Boolean);
  };

  // Get all form warnings for summary
  const getAllWarnings = (): string[] => {
    return Object.values(errors)
      .filter(result => result.warnings && result.warnings.length > 0)
      .flatMap(result => result.warnings || [])
      .filter(Boolean);
  };

  const formErrors = getAllErrors();
  const formWarnings = getAllWarnings();
  const hasErrors = formErrors.length > 0;
  const hasWarnings = formWarnings.length > 0;

  // Form content
  const FormContent = () => (
    <View style={[styles.container, style]}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Error Summary */}
      {showSummaryErrors && hasErrors && (
        <View 
          style={styles.errorSummary}
          accessibilityRole="alert"
          accessibilityLabel={`Form has ${formErrors.length} error${formErrors.length > 1 ? 's' : ''}`}
        >
          <Text style={styles.errorSummaryTitle}>
            Please fix the following errors:
          </Text>
          {formErrors.map((error, index) => (
            <Text key={index} style={styles.errorSummaryText}>
              • {error}
            </Text>
          ))}
        </View>
      )}

      {/* Warning Summary */}
      {showSummaryErrors && hasWarnings && !hasErrors && (
        <View 
          style={styles.warningSummary}
          accessibilityRole="alert"
          accessibilityLabel={`Form has ${formWarnings.length} warning${formWarnings.length > 1 ? 's' : ''}`}
        >
          <Text style={styles.warningSummaryTitle}>
            Please review the following:
          </Text>
          {formWarnings.map((warning, index) => (
            <Text key={index} style={styles.warningSummaryText}>
              • {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.fieldsContainer}>
        {children}
      </View>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View 
          style={styles.loadingOverlay}
          accessibilityRole="progressbar"
          accessibilityLabel="Submitting form"
        >
          <Text style={styles.loadingText}>Submitting...</Text>
        </View>
      )}
    </View>
  );

  // Render with or without scroll and keyboard avoiding
  if (scrollEnabled) {
    const ScrollContainer = keyboardAvoidingEnabled ? 
      ({ children: scrollChildren }: { children: ReactNode }) => (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {scrollChildren}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : 
      ({ children: scrollChildren }: { children: ReactNode }) => (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {scrollChildren}
        </ScrollView>
      );

    return (
      <ScrollContainer>
        <FormContent />
      </ScrollContainer>
    );
  }

  if (keyboardAvoidingEnabled) {
    return (
      <KeyboardAvoidingView
        style={[styles.keyboardAvoid, contentContainerStyle]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <FormContent />
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={contentContainerStyle}>
      <FormContent />
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.LG,
  },
  header: {
    marginBottom: SPACING.LG,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  errorSummary: {
    backgroundColor: COLORS.ERROR + '10',
    borderColor: COLORS.ERROR,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  errorSummaryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.ERROR,
    marginBottom: SPACING.SM,
  },
  errorSummaryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.ERROR,
    marginBottom: 2,
  },
  warningSummary: {
    backgroundColor: COLORS.WARNING + '10',
    borderColor: COLORS.WARNING,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  warningSummaryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.WARNING,
    marginBottom: SPACING.SM,
  },
  warningSummaryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.WARNING,
    marginBottom: 2,
  },
  fieldsContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.WHITE + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
  },
});

export default ValidatedForm;
