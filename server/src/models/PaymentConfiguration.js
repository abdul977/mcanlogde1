import { Schema, model } from "mongoose";

const paymentConfigurationSchema = new Schema({
  // Organization details
  organizationName: {
    type: String,
    default: "Muslim Corps Members Association of Nigeria (MCAN)",
    trim: true
  },
  
  // Bank account details
  bankDetails: {
    accountName: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      default: "Muslim Corps Members Association of Nigeria"
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      trim: true
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true
    },
    sortCode: {
      type: String,
      trim: true
    },
    swiftCode: {
      type: String,
      trim: true
    }
  },

  // Mobile money details
  mobilePayment: {
    mtn: {
      number: {
        type: String,
        trim: true
      },
      accountName: {
        type: String,
        trim: true
      }
    },
    airtel: {
      number: {
        type: String,
        trim: true
      },
      accountName: {
        type: String,
        trim: true
      }
    },
    glo: {
      number: {
        type: String,
        trim: true
      },
      accountName: {
        type: String,
        trim: true
      }
    },
    nineMobile: {
      number: {
        type: String,
        trim: true
      },
      accountName: {
        type: String,
        trim: true
      }
    }
  },

  // Online payment gateways
  onlinePayment: {
    paystack: {
      publicKey: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: false
      }
    },
    flutterwave: {
      publicKey: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: false
      }
    }
  },

  // Payment instructions
  paymentInstructions: {
    general: {
      type: String,
      default: "Please make payment to the account details provided below and upload your payment proof for verification.",
      trim: true
    },
    bankTransfer: {
      type: String,
      default: "Transfer to the bank account details below and upload your payment receipt.",
      trim: true
    },
    mobilePayment: {
      type: String,
      default: "Send money to any of the mobile money numbers below and upload your transaction screenshot.",
      trim: true
    }
  },

  // Contact information for payment queries
  paymentSupport: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    workingHours: {
      type: String,
      default: "Monday - Friday: 9:00 AM - 5:00 PM",
      trim: true
    }
  },

  // Currency settings
  currency: {
    primary: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "GBP", "EUR"]
    },
    symbol: {
      type: String,
      default: "₦"
    }
  },

  // Payment verification settings
  verificationSettings: {
    autoApprovalLimit: {
      type: Number,
      default: 0, // 0 means no auto-approval
      min: 0
    },
    requireTransactionReference: {
      type: Boolean,
      default: false
    },
    allowedFileTypes: {
      type: [String],
      default: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      enum: ["image/jpeg", "image/png", "image/jpg", "image/gif", "application/pdf"]
    },
    maxFileSize: {
      type: Number,
      default: 5242880, // 5MB in bytes
      min: 1048576, // 1MB minimum
      max: 10485760 // 10MB maximum
    }
  },

  // System settings
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Audit fields
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
paymentConfigurationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get current configuration
paymentConfigurationSchema.statics.getCurrentConfig = async function() {
  let config = await this.findOne({ isActive: true });
  
  // Create default configuration if none exists
  if (!config) {
    config = await this.create({
      bankDetails: {
        accountName: "Muslim Corps Members Association of Nigeria",
        accountNumber: "",
        bankName: ""
      }
    });
  }
  
  return config;
};

// Instance method to get formatted bank details
paymentConfigurationSchema.methods.getFormattedBankDetails = function() {
  return {
    accountName: this.bankDetails.accountName,
    accountNumber: this.bankDetails.accountNumber,
    bankName: this.bankDetails.bankName,
    sortCode: this.bankDetails.sortCode || 'N/A'
  };
};

// Instance method to get active mobile payment options
paymentConfigurationSchema.methods.getActiveMobilePayments = function() {
  const activeOptions = [];
  
  Object.keys(this.mobilePayment).forEach(provider => {
    const details = this.mobilePayment[provider];
    if (details.number && details.number.trim()) {
      activeOptions.push({
        provider: provider.toUpperCase(),
        number: details.number,
        accountName: details.accountName || this.organizationName
      });
    }
  });
  
  return activeOptions;
};

// Instance method to validate payment configuration
paymentConfigurationSchema.methods.validateConfiguration = function() {
  const errors = [];
  
  // Check if at least one payment method is configured
  const hasBankDetails = this.bankDetails.accountNumber && this.bankDetails.bankName;
  const hasMobilePayment = this.getActiveMobilePayments().length > 0;
  const hasOnlinePayment = (this.onlinePayment.paystack.isActive && this.onlinePayment.paystack.publicKey) ||
                          (this.onlinePayment.flutterwave.isActive && this.onlinePayment.flutterwave.publicKey);
  
  if (!hasBankDetails && !hasMobilePayment && !hasOnlinePayment) {
    errors.push("At least one payment method must be configured");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const PaymentConfiguration = model("PaymentConfiguration", paymentConfigurationSchema);

export default PaymentConfiguration;
