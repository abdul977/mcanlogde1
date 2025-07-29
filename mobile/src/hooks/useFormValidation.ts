/**
 * Real-time Form Validation Hook
 * 
 * This hook provides real-time form validation with debouncing,
 * accessibility features, and comprehensive error handling.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils';
import {
  ValidationResult,
  ValidationConfig,
  validateForm,
  isFormValid,
  getFormErrors,
  getFormWarnings,
} from '../utils/validation';

// Form validation state
interface FormValidationState {
  values: Record<string, string>;
  errors: Record<string, ValidationResult>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
}

// Form validation actions
interface FormValidationActions {
  setValue: (field: string, value: string) => void;
  setValues: (values: Record<string, string>) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  validateField: (field: string) => ValidationResult;
  validateAllFields: () => Record<string, ValidationResult>;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  reset: (initialValues?: Record<string, string>) => void;
  handleSubmit: (onSubmit: (values: Record<string, string>) => Promise<void> | void) => Promise<void>;
}

// Hook options
interface UseFormValidationOptions {
  initialValues?: Record<string, string>;
  validationRules: Record<string, ValidationConfig>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  onValidationChange?: (isValid: boolean, errors: Record<string, ValidationResult>) => void;
}

// Hook return type
type UseFormValidationReturn = FormValidationState & FormValidationActions;

export const useFormValidation = (options: UseFormValidationOptions): UseFormValidationReturn => {
  const {
    initialValues = {},
    validationRules,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    onValidationChange,
  } = options;

  // State
  const [values, setValuesState] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, ValidationResult>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for debouncing
  const debouncedValidateRef = useRef<Record<string, ReturnType<typeof debounce>>>();

  // Initialize debounced validators
  useEffect(() => {
    debouncedValidateRef.current = {};
    Object.keys(validationRules).forEach(field => {
      debouncedValidateRef.current![field] = debounce((value: string) => {
        const result = validateSingleField(field, value);
        setErrors(prev => ({ ...prev, [field]: result }));
      }, debounceMs);
    });
  }, [validationRules, debounceMs]);

  // Validate single field
  const validateSingleField = useCallback((field: string, value: string): ValidationResult => {
    const config = validationRules[field];
    if (!config) {
      return { isValid: true, errors: [] };
    }

    // Use the form validation utility
    const formData = { ...values, [field]: value };
    const results = validateForm(formData, { [field]: config });
    return results[field] || { isValid: true, errors: [] };
  }, [validationRules, values]);

  // Validate all fields
  const validateAllFields = useCallback((): Record<string, ValidationResult> => {
    const results = validateForm(values, validationRules);
    setErrors(results);
    return results;
  }, [values, validationRules]);

  // Set single value
  const setValue = useCallback((field: string, value: string) => {
    setValuesState(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (validateOnChange && validationRules[field]) {
      if (validationRules[field].realTime !== false) {
        const debouncedValidator = debouncedValidateRef.current?.[field];
        if (debouncedValidator) {
          debouncedValidator(value);
        } else {
          // Immediate validation if no debouncing
          const result = validateSingleField(field, value);
          setErrors(prev => ({ ...prev, [field]: result }));
        }
      }
    }
  }, [validateOnChange, validationRules, validateSingleField]);

  // Set multiple values
  const setValues = useCallback((newValues: Record<string, string>) => {
    setValuesState(newValues);
    
    if (validateOnChange) {
      const results = validateForm(newValues, validationRules);
      setErrors(results);
    }
  }, [validateOnChange, validationRules]);

  // Set field touched
  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [field]: isTouched }));

    // Validate on blur if enabled
    if (isTouched && validateOnBlur && validationRules[field]) {
      const result = validateSingleField(field, values[field] || '');
      setErrors(prev => ({ ...prev, [field]: result }));
    }
  }, [validateOnBlur, validationRules, validateSingleField, values]);

  // Set multiple touched
  const setTouched = useCallback((newTouched: Record<string, boolean>) => {
    setTouchedState(newTouched);
  }, []);

  // Validate specific field
  const validateField = useCallback((field: string): ValidationResult => {
    const result = validateSingleField(field, values[field] || '');
    setErrors(prev => ({ ...prev, [field]: result }));
    return result;
  }, [validateSingleField, values]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Reset form
  const reset = useCallback((newInitialValues?: Record<string, string>) => {
    const resetValues = newInitialValues || initialValues;
    setValuesState(resetValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, string>) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    try {
      // Validate all fields before submission
      const validationResults = validateAllFields();
      const formIsValid = isFormValid(validationResults);

      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouchedState(allTouched);

      if (formIsValid) {
        await onSubmit(values);
      } else {
        // Focus on first error field for accessibility
        const firstErrorField = Object.keys(validationResults).find(
          field => !validationResults[field].isValid
        );
        if (firstErrorField) {
          // In a real implementation, you might want to focus the field
          console.warn(`Validation failed for field: ${firstErrorField}`);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAllFields, validationRules, values]);

  // Computed values
  const formIsValid = isFormValid(errors);
  const hasErrors = Object.values(errors).some(result => !result.isValid);
  const hasWarnings = Object.values(errors).some(result => result.warnings && result.warnings.length > 0);

  // Call validation change callback
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(formIsValid, errors);
    }
  }, [formIsValid, errors, onValidationChange]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValid: formIsValid,
    hasErrors,
    hasWarnings,

    // Actions
    setValue,
    setValues,
    setFieldTouched,
    setTouched,
    validateField,
    validateAllFields,
    clearErrors,
    clearFieldError,
    reset,
    handleSubmit,
  };
};

// Helper hook for individual field validation
export const useFieldValidation = (
  fieldName: string,
  value: string,
  config: ValidationConfig,
  debounceMs: number = 300
) => {
  const [result, setResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidate = useCallback(
    debounce((val: string) => {
      setIsValidating(true);
      
      // Use the form validation utility
      const formData = { [fieldName]: val };
      const results = validateForm(formData, { [fieldName]: config });
      const fieldResult = results[fieldName] || { isValid: true, errors: [] };
      
      setResult(fieldResult);
      setIsValidating(false);
    }, debounceMs),
    [fieldName, config, debounceMs]
  );

  useEffect(() => {
    if (config.realTime !== false) {
      debouncedValidate(value);
    }
  }, [value, debouncedValidate, config.realTime]);

  const validateNow = useCallback(() => {
    const formData = { [fieldName]: value };
    const results = validateForm(formData, { [fieldName]: config });
    const fieldResult = results[fieldName] || { isValid: true, errors: [] };
    setResult(fieldResult);
    return fieldResult;
  }, [fieldName, value, config]);

  return {
    result,
    isValidating,
    validateNow,
  };
};

// Accessibility helpers
export const getFieldAccessibilityProps = (
  fieldName: string,
  errors: Record<string, ValidationResult>,
  touched: Record<string, boolean>
) => {
  const fieldError = errors[fieldName];
  const isFieldTouched = touched[fieldName];
  const hasError = fieldError && !fieldError.isValid && isFieldTouched;
  const hasWarning = fieldError && fieldError.warnings && fieldError.warnings.length > 0 && isFieldTouched;

  return {
    accessibilityLabel: fieldName,
    // Note: TextInput has appropriate default accessibility behavior,
    // so we don't need to set accessibilityRole
    accessibilityState: {
      invalid: hasError,
    },
    accessibilityHint: hasError
      ? fieldError.errors.join('. ')
      : hasWarning
        ? fieldError.warnings!.join('. ')
        : undefined,
  };
};
