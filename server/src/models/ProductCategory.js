import { Schema, model } from "mongoose";
import slug from "slugify";

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    unique: true,
    maxlength: [100, "Category name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Category description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  // Category hierarchy
  parent: {
    type: Schema.Types.ObjectId,
    ref: "ProductCategory",
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: [0, "Level cannot be negative"],
    max: [3, "Maximum category depth is 3 levels"]
  },
  // Visual representation
  icon: {
    type: String,
    trim: true,
    default: "shopping-bag"
  },
  image: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: "#3B82F6"
  },
  // Category properties
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Display and sorting
  displayOrder: {
    type: Number,
    default: 0
  },
  showInMenu: {
    type: Boolean,
    default: true
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },
  // SEO fields
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
  // Category-specific attributes for products
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["text", "number", "select", "multiselect", "boolean"],
      default: "text"
    },
    options: [{
      type: String,
      trim: true
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    isFilterable: {
      type: Boolean,
      default: true
    }
  }],
  // Category statistics
  productCount: {
    type: Number,
    default: 0,
    min: [0, "Product count cannot be negative"]
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
productCategorySchema.index({ name: 1 });
productCategorySchema.index({ slug: 1 });
productCategorySchema.index({ parent: 1, displayOrder: 1 });
productCategorySchema.index({ isActive: 1, isVisible: 1 });
productCategorySchema.index({ isFeatured: 1, isActive: 1 });
productCategorySchema.index({ level: 1 });

// Virtual for full category path
productCategorySchema.virtual('path', {
  ref: 'ProductCategory',
  localField: 'parent',
  foreignField: '_id',
  justOne: true
});

// Virtual for subcategories
productCategorySchema.virtual('subcategories', {
  ref: 'ProductCategory',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products in this category
productCategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save middleware
productCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug from name if not provided
  if (this.name && !this.slug) {
    this.slug = slug(this.name, { lower: true, strict: true });
  }
  
  next();
});

// Pre-save middleware to set level based on parent
productCategorySchema.pre('save', async function(next) {
  if (this.parent) {
    try {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
      }
    } catch (error) {
      return next(error);
    }
  } else {
    this.level = 0;
  }
  next();
});

// Static methods
productCategorySchema.statics.findActive = function() {
  return this.find({ isActive: true, isVisible: true });
};

productCategorySchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isVisible: true, isFeatured: true });
};

productCategorySchema.statics.findRootCategories = function() {
  return this.find({ parent: null, isActive: true, isVisible: true })
    .sort({ displayOrder: 1, name: 1 });
};

productCategorySchema.statics.findByParent = function(parentId) {
  return this.find({ parent: parentId, isActive: true, isVisible: true })
    .sort({ displayOrder: 1, name: 1 });
};

productCategorySchema.statics.findMenuCategories = function() {
  return this.find({ 
    showInMenu: true, 
    isActive: true, 
    isVisible: true 
  }).sort({ displayOrder: 1, name: 1 });
};

productCategorySchema.statics.findHomepageCategories = function() {
  return this.find({ 
    showOnHomepage: true, 
    isActive: true, 
    isVisible: true 
  }).sort({ displayOrder: 1, name: 1 });
};

// Instance methods
productCategorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

productCategorySchema.methods.getAllSubcategories = async function() {
  const subcategories = [];
  
  const findSubcategories = async (categoryId) => {
    const subs = await this.constructor.find({ parent: categoryId });
    for (const sub of subs) {
      subcategories.push(sub);
      await findSubcategories(sub._id);
    }
  };
  
  await findSubcategories(this._id);
  return subcategories;
};

// Post-remove middleware to update product count
productCategorySchema.post('remove', async function() {
  // Move products to parent category or uncategorized
  const Product = model('Product');
  
  if (this.parent) {
    await Product.updateMany(
      { category: this._id },
      { category: this.parent }
    );
  } else {
    // Create or find "Uncategorized" category
    let uncategorized = await this.constructor.findOne({ name: 'Uncategorized' });
    if (!uncategorized) {
      uncategorized = await this.constructor.create({
        name: 'Uncategorized',
        description: 'Products without a specific category',
        slug: 'uncategorized'
      });
    }
    
    await Product.updateMany(
      { category: this._id },
      { category: uncategorized._id }
    );
  }
});

const ProductCategory = model("ProductCategory", productCategorySchema, "productcategories");
export default ProductCategory;
