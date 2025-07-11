import PaymentConfiguration from "../models/PaymentConfiguration.js";

// Get current payment configuration
export const getPaymentConfiguration = async (req, res) => {
  try {
    const config = await PaymentConfiguration.getCurrentConfig();
    
    res.status(200).json({
      success: true,
      message: "Payment configuration retrieved successfully",
      configuration: config
    });
  } catch (error) {
    console.error("Error fetching payment configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment configuration",
      error: error.message
    });
  }
};

// Update payment configuration (Admin only)
export const updatePaymentConfiguration = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;
    const updateData = req.body;
    
    // Add audit information
    updateData.lastUpdatedBy = adminId;
    updateData.updatedAt = new Date();
    
    let config = await PaymentConfiguration.findOne({ isActive: true });
    
    if (!config) {
      // Create new configuration if none exists
      config = new PaymentConfiguration(updateData);
    } else {
      // Update existing configuration
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && updateData[key] !== null && !Array.isArray(updateData[key])) {
          // Handle nested objects
          config[key] = { ...config[key], ...updateData[key] };
        } else {
          config[key] = updateData[key];
        }
      });
    }
    
    // Validate configuration before saving
    const validation = config.validateConfiguration();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment configuration",
        errors: validation.errors
      });
    }
    
    await config.save();
    
    res.status(200).json({
      success: true,
      message: "Payment configuration updated successfully",
      configuration: config
    });
  } catch (error) {
    console.error("Error updating payment configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment configuration",
      error: error.message
    });
  }
};

// Get formatted payment details for users
export const getPaymentDetails = async (req, res) => {
  try {
    const config = await PaymentConfiguration.getCurrentConfig();
    
    // Return only necessary information for users
    const paymentDetails = {
      organizationName: config.organizationName,
      bankDetails: config.getFormattedBankDetails(),
      mobilePayments: config.getActiveMobilePayments(),
      paymentInstructions: config.paymentInstructions,
      paymentSupport: config.paymentSupport,
      currency: config.currency,
      verificationSettings: {
        allowedFileTypes: config.verificationSettings.allowedFileTypes,
        maxFileSize: config.verificationSettings.maxFileSize,
        requireTransactionReference: config.verificationSettings.requireTransactionReference
      }
    };
    
    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      paymentDetails
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message
    });
  }
};

// Test payment configuration
export const testPaymentConfiguration = async (req, res) => {
  try {
    const config = await PaymentConfiguration.getCurrentConfig();
    
    const validation = config.validateConfiguration();
    const bankDetails = config.getFormattedBankDetails();
    const mobilePayments = config.getActiveMobilePayments();
    
    const testResults = {
      isValid: validation.isValid,
      errors: validation.errors,
      hasBankDetails: !!(bankDetails.accountNumber && bankDetails.bankName),
      mobilePaymentCount: mobilePayments.length,
      onlinePaymentActive: config.onlinePayment.paystack.isActive || config.onlinePayment.flutterwave.isActive,
      lastUpdated: config.updatedAt
    };
    
    res.status(200).json({
      success: true,
      message: "Payment configuration test completed",
      testResults
    });
  } catch (error) {
    console.error("Error testing payment configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test payment configuration",
      error: error.message
    });
  }
};

// Reset payment configuration to defaults (Admin only)
export const resetPaymentConfiguration = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;
    
    // Deactivate current configuration
    await PaymentConfiguration.updateMany({ isActive: true }, { isActive: false });
    
    // Create new default configuration
    const defaultConfig = new PaymentConfiguration({
      lastUpdatedBy: adminId
    });
    
    await defaultConfig.save();
    
    res.status(200).json({
      success: true,
      message: "Payment configuration reset to defaults successfully",
      configuration: defaultConfig
    });
  } catch (error) {
    console.error("Error resetting payment configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset payment configuration",
      error: error.message
    });
  }
};

// Get payment configuration history (Admin only)
export const getPaymentConfigurationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const history = await PaymentConfiguration.find()
      .populate('lastUpdatedBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PaymentConfiguration.countDocuments();
    
    res.status(200).json({
      success: true,
      message: "Payment configuration history retrieved successfully",
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching payment configuration history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment configuration history",
      error: error.message
    });
  }
};

// Validate specific payment method (Admin only)
export const validatePaymentMethod = async (req, res) => {
  try {
    const { method, details } = req.body;
    
    if (!method || !details) {
      return res.status(400).json({
        success: false,
        message: "Payment method and details are required"
      });
    }
    
    const errors = [];
    
    switch (method) {
      case 'bank':
        if (!details.accountNumber) errors.push("Account number is required");
        if (!details.bankName) errors.push("Bank name is required");
        if (!details.accountName) errors.push("Account name is required");
        break;
        
      case 'mobile':
        if (!details.number) errors.push("Mobile number is required");
        if (!details.provider) errors.push("Provider is required");
        break;
        
      case 'online':
        if (!details.publicKey) errors.push("Public key is required");
        if (!details.gateway) errors.push("Gateway is required");
        break;
        
      default:
        errors.push("Invalid payment method");
    }
    
    res.status(200).json({
      success: true,
      message: "Payment method validation completed",
      isValid: errors.length === 0,
      errors
    });
  } catch (error) {
    console.error("Error validating payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate payment method",
      error: error.message
    });
  }
};
