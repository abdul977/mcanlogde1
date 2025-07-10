import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  // Customer information
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  // Order items
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productSnapshot: {
      name: String,
      sku: String,
      price: Number,
      image: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"]
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"]
    },
    variants: [{
      name: String,
      value: String
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Item notes cannot exceed 500 characters"]
    }
  }],
  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: [0, "Subtotal cannot be negative"]
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, "Tax amount cannot be negative"]
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, "Shipping cost cannot be negative"]
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, "Discount amount cannot be negative"]
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"]
  },
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN", "USD"]
  },
  // Order status
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed", 
      "processing", 
      "shipped", 
      "delivered", 
      "cancelled", 
      "refunded",
      "returned"
    ],
    default: "pending",
    required: true
  },
  // Payment information
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
    default: "pending",
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "card", "cash_on_delivery", "mobile_money"],
    required: true
  },
  paymentReference: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  },
  // Shipping information
  shippingAddress: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: "Nigeria",
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  // Billing address (optional, defaults to shipping)
  billingAddress: {
    fullName: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  // Shipping details
  shippingMethod: {
    type: String,
    enum: ["standard", "express", "pickup", "same_day"],
    default: "standard"
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  // Order notes and communication
  customerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, "Customer notes cannot exceed 1000 characters"]
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, "Admin notes cannot exceed 1000 characters"]
  },
  // Order history/timeline
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  // Discount and coupon information
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed_amount", "free_shipping"]
  },
  // Fulfillment information
  fulfillmentStatus: {
    type: String,
    enum: ["unfulfilled", "partially_fulfilled", "fulfilled"],
    default: "unfulfilled"
  },
  // Return and refund information
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String,
    trim: true
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, "Refund amount cannot be negative"]
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "items.product": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ trackingNumber: 1 });

// Virtual for order total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate order number if not provided
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `MCAN${timestamp.slice(-6)}${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;
  
  // Set status timestamps
  if (this.isModified('status')) {
    const now = new Date();
    const statusEntry = {
      status: this.status,
      timestamp: now,
      updatedBy: this._updatedBy // Set this before saving if needed
    };
    
    this.statusHistory.push(statusEntry);
    
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'shipped':
        if (!this.shippedAt) this.shippedAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  // Set payment timestamp
  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  // Copy shipping address to billing if billing is empty
  if (!this.billingAddress.fullName && this.shippingAddress.fullName) {
    this.billingAddress = { ...this.shippingAddress };
  }
  
  next();
});

// Static methods
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findPendingOrders = function() {
  return this.find({ 
    status: { $in: ['pending', 'confirmed', 'processing'] } 
  }).sort({ createdAt: -1 });
};

orderSchema.statics.findRecentOrders = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({ 
    createdAt: { $gte: startDate } 
  }).sort({ createdAt: -1 });
};

// Instance methods
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

orderSchema.methods.canBeShipped = function() {
  return this.status === 'processing' && this.paymentStatus === 'paid';
};

orderSchema.methods.addStatusUpdate = function(status, note, updatedBy) {
  this.status = status;
  this._updatedBy = updatedBy;
  
  if (note) {
    this.statusHistory[this.statusHistory.length - 1].note = note;
  }
  
  return this.save();
};

const Order = model("Order", orderSchema, "orders");
export default Order;
