/**
 * Enhanced Validation System for MCAN Lodge Mobile App
 * 
 * This module provides comprehensive form validation with real-time feedback,
 * accessibility features, and detailed error reporting.
 */

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  strength?: 'weak' | 'medium' | 'strong';
}

// Field validation configuration
export interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => ValidationResult;
  realTime?: boolean;
  debounceMs?: number;
}

// Email validation with comprehensive checks
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || !email.trim()) {
    return { isValid: false, errors: ['Email is required'] };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
  }

  // Length validation
  if (trimmedEmail.length > 254) {
    errors.push('Email address is too long');
  }

  // Local part validation (before @)
  const [localPart, domain] = trimmedEmail.split('@');
  if (localPart && localPart.length > 64) {
    errors.push('Email address format is invalid');
  }

  // Domain validation
  if (domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      errors.push('Email domain is invalid');
    }

    // Common domain warnings
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    
    if (suspiciousDomains.some(d => domain.includes(d))) {
      warnings.push('Temporary email addresses may not receive important notifications');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Enhanced password validation with strength assessment
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let strengthScore = 0;

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  // Length validation
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    strengthScore += 1;
  }

  if (password.length >= 12) {
    strengthScore += 1;
  }

  // Character type validation
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strengthScore += 1;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strengthScore += 1;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    strengthScore += 1;
  }

  if (!hasSpecialChars) {
    warnings.push('Consider adding special characters for stronger security');
  } else {
    strengthScore += 1;
  }

  // Common password patterns
  const commonPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
    /^(password|123456|qwerty|admin|login|welcome)/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password is too common or predictable');
    strengthScore = Math.max(0, strengthScore - 2);
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 5) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    strength,
  };
};

// Phone number validation with international support
export const validatePhone = (phone: string, countryCode: string = 'NG'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone || !phone.trim()) {
    return { isValid: false, errors: ['Phone number is required'] };
  }

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Nigerian phone number validation
  if (countryCode === 'NG') {
    const nigerianRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    if (!nigerianRegex.test(cleanPhone)) {
      errors.push('Please enter a valid Nigerian phone number');
    }
  } else {
    // International phone number validation
    const internationalRegex = /^[\+]?[1-9][\d]{7,14}$/;
    if (!internationalRegex.test(cleanPhone)) {
      errors.push('Please enter a valid phone number');
    }
  }

  // Length validation
  if (cleanPhone.length < 10) {
    errors.push('Phone number is too short');
  } else if (cleanPhone.length > 15) {
    errors.push('Phone number is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || !name.trim()) {
    return { isValid: false, errors: [`${fieldName} is required`] };
  }

  const trimmedName = name.trim();

  // Length validation
  if (trimmedName.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }

  if (trimmedName.length > 50) {
    errors.push(`${fieldName} must be less than 50 characters`);
  }

  // Character validation
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }

  // Check for suspicious patterns
  if (/^\d+$/.test(trimmedName)) {
    errors.push(`${fieldName} cannot be only numbers`);
  }

  if (trimmedName.length < 3) {
    warnings.push(`${fieldName} seems quite short`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = [];

  if (!confirmPassword) {
    return { isValid: false, errors: ['Please confirm your password'] };
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generic field validation
export const validateField = (value: string, config: ValidationConfig, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required validation
  if (config.required && (!value || !value.trim())) {
    return { isValid: false, errors: [`${fieldName} is required`] };
  }

  if (!value || !value.trim()) {
    return { isValid: true, errors: [] };
  }

  const trimmedValue = value.trim();

  // Length validation
  if (config.minLength && trimmedValue.length < config.minLength) {
    errors.push(`${fieldName} must be at least ${config.minLength} characters long`);
  }

  if (config.maxLength && trimmedValue.length > config.maxLength) {
    errors.push(`${fieldName} must be less than ${config.maxLength} characters`);
  }

  // Pattern validation
  if (config.pattern && !config.pattern.test(trimmedValue)) {
    errors.push(`${fieldName} format is invalid`);
  }

  // Custom validation
  if (config.customValidator) {
    const customResult = config.customValidator(trimmedValue);
    errors.push(...customResult.errors);
    if (customResult.warnings) {
      warnings.push(...customResult.warnings);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Form validation helper
export const validateForm = (
  formData: Record<string, string>,
  validationRules: Record<string, ValidationConfig>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName] || '';
    const config = validationRules[fieldName];
    
    // Use specific validators for known field types
    if (fieldName.toLowerCase().includes('email')) {
      results[fieldName] = validateEmail(value);
    } else if (fieldName.toLowerCase().includes('password') && !fieldName.toLowerCase().includes('confirm')) {
      results[fieldName] = validatePassword(value);
    } else if (fieldName.toLowerCase().includes('confirm') && fieldName.toLowerCase().includes('password')) {
      results[fieldName] = validateConfirmPassword(formData.password || '', value);
    } else if (fieldName.toLowerCase().includes('phone')) {
      results[fieldName] = validatePhone(value);
    } else if (fieldName.toLowerCase().includes('name')) {
      results[fieldName] = validateName(value, fieldName);
    } else if (fieldName === 'callUpNumber') {
      results[fieldName] = validateCallUpNumber(value);
    } else if (fieldName === 'batch') {
      results[fieldName] = validateBatch(value);
    } else if (fieldName === 'stateCode') {
      results[fieldName] = validateStateCode(value);
    } else if (fieldName === 'stream') {
      results[fieldName] = validateStream(value);
    } else {
      results[fieldName] = validateField(value, config, fieldName);
    }
  });

  return results;
};

// Check if form is valid
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

// Get all form errors
export const getFormErrors = (validationResults: Record<string, ValidationResult>): string[] => {
  return Object.values(validationResults)
    .flatMap(result => result.errors)
    .filter(Boolean);
};

// Get all form warnings
export const getFormWarnings = (validationResults: Record<string, ValidationResult>): string[] => {
  return Object.values(validationResults)
    .flatMap(result => result.warnings || [])
    .filter(Boolean);
};

// NYSC-specific validation functions

// Validate NYSC call-up number
export const validateCallUpNumber = (callUpNumber: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!callUpNumber || !callUpNumber.trim()) {
    return { isValid: false, errors: ['Call-up number is required'] };
  }

  const trimmedCallUp = callUpNumber.trim().toUpperCase();

  // NYSC call-up number format: NYSC/2023/BATCH/STATE/STREAM/NUMBER
  // Example: NYSC/2023/B/LA/A/12345
  const callUpRegex = /^NYSC\/\d{4}\/[ABC]\/[A-Z]{2}\/[ABC]\/\d{4,6}$/;

  if (!callUpRegex.test(trimmedCallUp)) {
    errors.push('Call-up number format should be: NYSC/YEAR/BATCH/STATE/STREAM/NUMBER');
    errors.push('Example: NYSC/2023/B/LA/A/12345');
  }

  // Length validation
  if (trimmedCallUp.length < 15 || trimmedCallUp.length > 25) {
    errors.push('Call-up number length is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Validate NYSC batch
export const validateBatch = (batch: string): ValidationResult => {
  const errors: string[] = [];

  if (!batch || !batch.trim()) {
    return { isValid: false, errors: ['Batch is required'] };
  }

  const trimmedBatch = batch.trim().toUpperCase();

  // Batch format: YYYY Batch [A|B|C]
  // Example: 2023 Batch B
  const batchRegex = /^\d{4}\s+BATCH\s+[ABC]$/;

  if (!batchRegex.test(trimmedBatch)) {
    errors.push('Batch format should be: YYYY Batch [A|B|C]');
    errors.push('Example: 2023 Batch B');
  }

  // Year validation (should be reasonable)
  const currentYear = new Date().getFullYear();
  const yearMatch = trimmedBatch.match(/^(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year < 1973 || year > currentYear + 1) {
      errors.push('Batch year seems invalid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate NYSC state code
export const validateStateCode = (stateCode: string): ValidationResult => {
  const errors: string[] = [];

  if (!stateCode || !stateCode.trim()) {
    return { isValid: false, errors: ['State code is required'] };
  }

  const trimmedStateCode = stateCode.trim().toUpperCase();

  // Valid Nigerian state codes
  const validStateCodes = [
    'AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT',
    'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN',
    'KT', 'KB', 'KG', 'KW', 'LA', 'NA', 'NI', 'OG', 'ON', 'OS',
    'OY', 'PL', 'RI', 'SO', 'TA', 'YO', 'ZA'
  ];

  if (!validStateCodes.includes(trimmedStateCode)) {
    errors.push('Please select a valid Nigerian state code');
  }

  if (trimmedStateCode.length !== 2) {
    errors.push('State code must be exactly 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate NYSC stream
export const validateStream = (stream: string): ValidationResult => {
  const errors: string[] = [];

  if (!stream || !stream.trim()) {
    return { isValid: false, errors: ['Stream is required'] };
  }

  const trimmedStream = stream.trim().toUpperCase();

  if (!['A', 'B', 'C'].includes(trimmedStream)) {
    errors.push('Stream must be A, B, or C');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
