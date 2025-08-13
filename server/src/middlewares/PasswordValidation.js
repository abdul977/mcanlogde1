import { validatePassword, checkPasswordHistory, getPasswordPolicy } from '../utils/passwordPolicy.js';
import User from '../models/User.js';

/**
 * Middleware to validate password policy compliance
 */
export const validatePasswordPolicy = async (req, res, next) => {
  try {
    const { password, email, name } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        code: 'PASSWORD_REQUIRED'
      });
    }
    
    // Prepare user info for validation
    const userInfo = {
      email,
      name,
      username: email?.split('@')[0]
    };
    
    // Validate password against policy
    const validation = validatePassword(password, userInfo);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: validation.errors,
        warnings: validation.warnings,
        strength: validation.strength,
        policy: getPasswordPolicy().description,
        code: 'PASSWORD_POLICY_VIOLATION'
      });
    }
    
    // Add validation results to request for use in controllers
    req.passwordValidation = validation;
    next();
    
  } catch (error) {
    console.error('Error in password validation middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating password',
      code: 'PASSWORD_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to check password history for existing users
 */
export const checkPasswordHistoryMiddleware = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const userId = req.user?.id || req.user?._id;
    
    if (!password) {
      return next();
    }
    
    let user = null;
    
    // Get user either from auth context or by email
    if (userId) {
      user = await User.findById(userId).select('+passwordHistory');
    } else if (email) {
      user = await User.findOne({ email }).select('+passwordHistory');
    }
    
    if (user && user.passwordHistory && user.passwordHistory.length > 0) {
      const historyCheck = await checkPasswordHistory(user, password);
      
      if (historyCheck.isReused) {
        return res.status(400).json({
          success: false,
          message: historyCheck.message,
          lastUsed: historyCheck.lastUsed,
          code: 'PASSWORD_RECENTLY_USED'
        });
      }
    }
    
    // Add user to request for use in controllers
    if (user) {
      req.targetUser = user;
    }
    
    next();
    
  } catch (error) {
    console.error('Error in password history middleware:', error);
    next(); // Continue on error to not block legitimate requests
  }
};

/**
 * Middleware to enforce strong passwords for admin roles
 */
export const enforceStrongPasswordForAdmins = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user?.id || req.user?._id;
    
    if (!password || !userId) {
      return next();
    }
    
    // Get user with roles
    const user = await User.findById(userId).populate('roles');
    
    if (!user) {
      return next();
    }
    
    // Check if user has admin roles that require stronger passwords
    const adminRoles = ['super_admin', 'national_admin', 'state_admin'];
    const hasAdminRole = user.roles?.some(role => 
      adminRoles.includes(role.name)
    ) || adminRoles.includes(user.role); // Legacy role check
    
    if (hasAdminRole) {
      const validation = req.passwordValidation;
      
      // Require higher strength for admin users
      if (!validation || validation.strength.score < 6) {
        return res.status(400).json({
          success: false,
          message: 'Admin accounts require stronger passwords (minimum score: 6/10)',
          currentScore: validation?.strength.score || 0,
          requiredScore: 6,
          suggestions: [
            'Use at least 12 characters',
            'Include uppercase and lowercase letters',
            'Include numbers and special characters',
            'Avoid common patterns and dictionary words'
          ],
          code: 'ADMIN_PASSWORD_TOO_WEAK'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Error in admin password enforcement middleware:', error);
    next(); // Continue on error
  }
};

/**
 * Middleware to provide password policy information
 */
export const getPasswordPolicyMiddleware = (req, res, next) => {
  try {
    const policy = getPasswordPolicy();
    
    res.json({
      success: true,
      policy: {
        requirements: policy.description,
        rules: {
          minLength: policy.minLength,
          maxLength: policy.maxLength,
          requireUppercase: policy.requireUppercase,
          requireLowercase: policy.requireLowercase,
          requireNumbers: policy.requireNumbers,
          requireSpecialChars: policy.requireSpecialChars,
          maxRepeatingChars: policy.maxRepeatingChars,
          specialChars: policy.specialChars
        },
        strengthLevels: {
          0: { level: 'very_weak', color: 'red', description: 'Very weak - easily guessed' },
          1: { level: 'weak', color: 'red', description: 'Weak - could be guessed' },
          2: { level: 'fair', color: 'orange', description: 'Fair - somewhat secure' },
          3: { level: 'good', color: 'yellow', description: 'Good - reasonably secure' },
          4: { level: 'strong', color: 'lightgreen', description: 'Strong - very secure' },
          5: { level: 'very_strong', color: 'green', description: 'Very strong - excellent security' }
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting password policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving password policy',
      code: 'POLICY_RETRIEVAL_ERROR'
    });
  }
};

/**
 * Middleware to check password strength in real-time
 */
export const checkPasswordStrength = (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        code: 'PASSWORD_REQUIRED'
      });
    }
    
    const userInfo = {
      email: req.body.email,
      name: req.body.name,
      username: req.body.email?.split('@')[0]
    };
    
    const validation = validatePassword(password, userInfo);
    
    res.json({
      success: true,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        strength: validation.strength,
        score: validation.score,
        recommendations: generatePasswordRecommendations(validation)
      }
    });
    
  } catch (error) {
    console.error('Error checking password strength:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking password strength',
      code: 'STRENGTH_CHECK_ERROR'
    });
  }
};

/**
 * Generate password improvement recommendations
 */
const generatePasswordRecommendations = (validation) => {
  const recommendations = [];
  
  if (validation.errors.length > 0) {
    recommendations.push(...validation.errors);
  }
  
  if (validation.strength.score < 6) {
    if (validation.strength.score < 3) {
      recommendations.push('Consider using a passphrase with multiple words');
      recommendations.push('Add numbers and special characters');
    }
    
    if (!/[A-Z]/.test(validation.password)) {
      recommendations.push('Add uppercase letters');
    }
    
    if (!/[0-9]/.test(validation.password)) {
      recommendations.push('Add numbers');
    }
    
    if (!/[^a-zA-Z0-9]/.test(validation.password)) {
      recommendations.push('Add special characters');
    }
    
    if (validation.password && validation.password.length < 12) {
      recommendations.push('Make it longer (12+ characters recommended)');
    }
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
};

export default {
  validatePasswordPolicy,
  checkPasswordHistoryMiddleware,
  enforceStrongPasswordForAdmins,
  getPasswordPolicyMiddleware,
  checkPasswordStrength
};
