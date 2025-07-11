import { Schema, model } from "mongoose";
import slug from "slugify";

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [200, "Product name cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, "Short description cannot exceed 300 characters"]
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
    max: [1000000, "Price cannot exceed 1,000,000 NGN"]
  },
  comparePrice: {
    type: Number,
    min: [0, "Compare price cannot be negative"]
    // Note: Compare price validation is handled in the controller
    // to properly handle updates where both price and comparePrice might change
  },
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN", "USD"]
  },
  sku: {
    type: String,
    required: [true, "SKU is required"],
    unique: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    trim: true
  },
  // Product categorization
  category: {
    type: Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: [true, "Product category is required"]
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // MCAN-specific branding
  brand: {
    type: String,
    default: "MCAN",
    enum: ["MCAN", "MCAN FCT", "MCAN Store"]
  },
  collection: {
    type: String,
    trim: true,
    enum: ["Islamic Wear", "Casual Wear", "Accessories", "Books", "Prayer Items", "Limited Edition"]
  },
  // Product variants and options
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      value: {
        type: String,
        required: true,
        trim: true
      },
      priceAdjustment: {
        type: Number,
        default: 0
      },
      sku: {
        type: String,
        trim: true
      }
    }]
  }],
  // Inventory management
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      required: function() {
        return this.inventory && this.inventory.trackQuantity;
      },
      min: [0, "Quantity cannot be negative"],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"]
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Reserved quantity cannot be negative"]
    }
  },
  // Product images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  // Product specifications
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // Dimensions and shipping
  dimensions: {
    length: {
      type: Number,
      min: [0, "Length cannot be negative"]
    },
    width: {
      type: Number,
      min: [0, "Width cannot be negative"]
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"]
    },
    unit: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm"
    }
  },
  weight: {
    value: {
      type: Number,
      min: [0, "Weight cannot be negative"]
    },
    unit: {
      type: String,
      enum: ["kg", "g", "lb", "oz"],
      default: "kg"
    }
  },
  // Product status and visibility
  status: {
    type: String,
    enum: ["draft", "active", "inactive", "archived"],
    default: "draft",
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // SEO and marketing
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, "Meta title cannot exceed 60 characters"]
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, "Meta description cannot exceed 160 characters"]
  },
  // Sales and analytics
  salesCount: {
    type: Number,
    default: 0,
    min: [0, "Sales count cannot be negative"]
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, "View count cannot be negative"]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"]
    },
    count: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be negative"]
    }
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
  publishedAt: {
    type: Date
  }
});

// Indexes for better query performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, isVisible: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ "inventory.quantity": 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  if (this.status !== 'active' || !this.isVisible) {
    return false;
  }
  
  if (!this.inventory.trackQuantity) {
    return true;
  }
  
  return this.inventory.quantity > this.inventory.reservedQuantity || this.inventory.allowBackorder;
});

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  if (!this.inventory.trackQuantity) {
    return null;
  }
  
  return Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackQuantity) {
    return false;
  }
  
  return this.availableQuantity <= this.inventory.lowStockThreshold;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug from name if not provided
  if (this.name && !this.slug) {
    this.slug = slug(this.name, { lower: true, strict: true });
  }
  
  // Set published date when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((image, index) => {
      if (image.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          image.isPrimary = false;
        }
      }
    });
    
    // If no primary image, set the first one as primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Static methods
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', isVisible: true });
};

productSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', isVisible: true, isFeatured: true });
};

productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'active', isVisible: true });
};

productSchema.statics.searchProducts = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active',
    isVisible: true
  }).sort({ score: { $meta: 'textScore' } });
};

const Product = model("Product", productSchema, "products");
export default Product;
