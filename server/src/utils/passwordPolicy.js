import argon2 from 'argon2';
import crypto from 'crypto';

// Common weak passwords list (subset for demonstration)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', 'admin123', 'root', 'toor', 'pass', 'test', 'guest',
  'user', 'login', 'changeme', 'secret', 'default', 'master'
]);

// Password policy configuration
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatingChars: 3,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  historyCount: 5, // Number of previous passwords to remember
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password against policy
 */
export const validatePassword = (password, userInfo = {}) => {
  const errors = [];
  const warnings = [];
  
  // Check length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }
  
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
  }
  
  // Check character requirements
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_POLICY.requireSpecialChars) {
    const specialCharRegex = new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${PASSWORD_POLICY.specialChars})`);
    }
  }
  
  // Check for repeating characters
  if (PASSWORD_POLICY.maxRepeatingChars > 0) {
    const repeatingPattern = new RegExp(`(.)\\1{${PASSWORD_POLICY.maxRepeatingChars},}`, 'i');
    if (repeatingPattern.test(password)) {
      errors.push(`Password cannot contain more than ${PASSWORD_POLICY.maxRepeatingChars} repeating characters`);
    }
  }
  
  // Check against common passwords
  if (PASSWORD_POLICY.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.has(lowerPassword)) {
      errors.push('Password is too common. Please choose a more unique password');
    }
    
    // Check for common patterns
    if (/^(password|admin|user|test|guest|login)\d*$/i.test(password)) {
      errors.push('Password follows a common pattern. Please choose a more unique password');
    }
    
    // Check for keyboard patterns
    const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234', 'abcd'];
    for (const pattern of keyboardPatterns) {
      if (lowerPassword.includes(pattern)) {
        warnings.push('Password contains keyboard patterns which may be easier to guess');
        break;
      }
    }
  }
  
  // Check if password contains user information
  if (PASSWORD_POLICY.preventUserInfoInPassword && userInfo) {
    const sensitiveFields = ['name', 'email', 'username', 'firstName', 'lastName'];
    const lowerPassword = password.toLowerCase();
    
    for (const field of sensitiveFields) {
      if (userInfo[field]) {
        const fieldValue = userInfo[field].toLowerCase();
        if (fieldValue.length >= 3 && lowerPassword.includes(fieldValue)) {
          errors.push(`Password cannot contain your ${field}`);
        }
      }
    }
    
    // Check email parts
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (emailParts.length >= 3 && lowerPassword.includes(emailParts)) {
        errors.push('Password cannot contain parts of your email address');
      }
    }
  }
  
  // Calculate password strength
  const strength = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    score: strength.score
  };
};

/**
 * Calculate password strength score
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Complexity scoring
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;
  
  // Pattern detection (negative scoring)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeating characters
  if (/012|123|234|345|456|567|678|789|890/.test(password)) score -= 1; // Sequential numbers
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) score -= 1; // Sequential letters
  
  // Determine strength level
  let level, color, description;
  if (score <= 2) {
    level = 'weak';
    color = 'red';
    description = 'Very weak password. Consider using a longer password with mixed characters.';
  } else if (score <= 4) {
    level = 'fair';
    color = 'orange';
    description = 'Fair password. Consider adding more character variety.';
  } else if (score <= 6) {
    level = 'good';
    color = 'yellow';
    description = 'Good password. Consider making it longer for better security.';
  } else if (score <= 8) {
    level = 'strong';
    color = 'lightgreen';
    description = 'Strong password. Well done!';
  } else {
    level = 'very_strong';
    color = 'green';
    description = 'Very strong password. Excellent security!';
  }
  
  return {
    score: Math.max(0, Math.min(10, score)),
    level,
    color,
    description,
    feedback
  };
};

/**
 * Hash password using Argon2
 */
export const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      saltLength: 32
    });
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password, hash) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Check if password was used before
 */
export const checkPasswordHistory = async (user, newPassword) => {
  if (!user.passwordHistory || user.passwordHistory.length === 0) {
    return { isReused: false };
  }
  
  for (const historyEntry of user.passwordHistory) {
    const isMatch = await verifyPassword(newPassword, historyEntry.hash);
    if (isMatch) {
      return {
        isReused: true,
        lastUsed: historyEntry.createdAt,
        message: 'This password was used recently. Please choose a different password.'
      };
    }
  }
  
  return { isReused: false };
};

/**
 * Add password to user's history
 */
export const addToPasswordHistory = async (user, passwordHash) => {
  if (!user.passwordHistory) {
    user.passwordHistory = [];
  }
  
  // Add new password to history
  user.passwordHistory.unshift({
    hash: passwordHash,
    createdAt: new Date()
  });
  
  // Keep only the last N passwords
  if (user.passwordHistory.length > PASSWORD_POLICY.historyCount) {
    user.passwordHistory = user.passwordHistory.slice(0, PASSWORD_POLICY.historyCount);
  }
  
  return user;
};

/**
 * Generate secure random password
 */
export const generateSecurePassword = (length = 16) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
};

/**
 * Get password policy information
 */
export const getPasswordPolicy = () => {
  return {
    ...PASSWORD_POLICY,
    description: {
      minLength: `Minimum ${PASSWORD_POLICY.minLength} characters`,
      maxLength: `Maximum ${PASSWORD_POLICY.maxLength} characters`,
      requireUppercase: 'At least one uppercase letter (A-Z)',
      requireLowercase: 'At least one lowercase letter (a-z)',
      requireNumbers: 'At least one number (0-9)',
      requireSpecialChars: `At least one special character (${PASSWORD_POLICY.specialChars})`,
      maxRepeatingChars: `No more than ${PASSWORD_POLICY.maxRepeatingChars} repeating characters`,
      preventCommonPasswords: 'Cannot be a commonly used password',
      preventUserInfoInPassword: 'Cannot contain your personal information'
    }
  };
};

export default {
  validatePassword,
  calculatePasswordStrength,
  hashPassword,
  verifyPassword,
  checkPasswordHistory,
  addToPasswordHistory,
  generateSecurePassword,
  getPasswordPolicy
};
