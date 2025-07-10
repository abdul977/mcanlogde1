import Product from "../models/Product.js";
import ProductCategory from "../models/ProductCategory.js";
import supabaseStorage from "../services/supabaseStorage.js";
import slug from "slugify";
import mongoose from "mongoose";

// Get all products (public)
export const getAllProductsController = async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      status = 'active', 
      sort = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    const query = { status, isVisible: true };

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Add stock filter
    if (inStock === 'true') {
      query.$expr = {
        $gt: [
          { $subtract: ["$inventory.quantity", "$inventory.reservedQuantity"] },
          0
        ]
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Get products with populated category
    const products = await Product.find(query)
      .populate('category', 'name slug description')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).send({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting products",
      error: error.message
    });
  }
};

// Get single product by slug (public)
export const getProductController = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      status: 'active',
      isVisible: true
    }).populate('category', 'name slug description');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, {
      $inc: { viewCount: 1 }
    });

    res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting product",
      error: error.message
    });
  }
};

// Get single product by ID (admin only)
export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .select('-__v');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting product",
      error: error.message
    });
  }
};

// Get featured products (public)
export const getFeaturedProductsController = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findFeatured()
      .populate('category', 'name slug')
      .limit(Number(limit))
      .sort({ salesCount: -1, createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Featured products fetched successfully",
      products
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting featured products",
      error: error.message
    });
  }
};

// Get products by category (public)
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

    // Validate category exists
    const category = await ProductCategory.findById(categoryId);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const products = await Product.findByCategory(categoryId)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({ 
      category: categoryId, 
      status: 'active', 
      isVisible: true 
    });

    res.status(200).send({
      success: true,
      message: "Products fetched successfully",
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug
      },
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting products by category",
      error: error.message
    });
  }
};

// Search products (public)
export const searchProductsController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).send({
        success: false,
        message: "Search keyword must be at least 2 characters long"
      });
    }

    const skip = (page - 1) * limit;

    const products = await Product.searchProducts(keyword.trim())
      .populate('category', 'name slug')
      .skip(skip)
      .limit(Number(limit));

    // Get total count for the search
    const totalResults = await Product.find({
      $text: { $search: keyword.trim() },
      status: 'active',
      isVisible: true
    }).countDocuments();

    res.status(200).send({
      success: true,
      message: `Search results for "${keyword}"`,
      keyword,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResults,
        pages: Math.ceil(totalResults / limit)
      }
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).send({
      success: false,
      message: "Error while searching products",
      error: error.message
    });
  }
};

// Get related products (public)
export const getRelatedProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    // Find related products by category, excluding current product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
      isVisible: true
    })
    .populate('category', 'name slug')
    .limit(Number(limit))
    .sort({ salesCount: -1, createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Related products fetched successfully",
      products: relatedProducts
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting related products",
      error: error.message
    });
  }
};

// Create product (admin only)
export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      sku,
      category,
      brand,
      collection,
      variants,
      inventory,
      specifications,
      dimensions,
      weight,
      tags,
      metaTitle,
      metaDescription,
      isFeatured
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !sku || !category) {
      return res.status(400).send({
        success: false,
        message: "Name, description, price, SKU, and category are required"
      });
    }

    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(409).send({
        success: false,
        message: "Product with this SKU already exists"
      });
    }

    // Validate category exists
    const categoryExists = await ProductCategory.findById(category);
    if (!categoryExists) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }

    // Handle image uploads if provided
    let images = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const uploadResult = await supabaseStorage.uploadFromTempFile(file, 'mcan-products', 'products');

        if (uploadResult.success) {
          images.push({
            url: uploadResult.data.secure_url,
            alt: `${name} - Image ${i + 1}`,
            isPrimary: i === 0,
            sortOrder: i
          });
        }
      }
    }

    // Create product
    const product = new Product({
      name,
      description,
      shortDescription,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : undefined,
      sku: sku.toUpperCase(),
      category,
      brand,
      collection,
      variants: variants ? JSON.parse(variants) : [],
      inventory: inventory ? JSON.parse(inventory) : { trackQuantity: true, quantity: 0 },
      specifications: specifications ? JSON.parse(specifications) : [],
      dimensions: dimensions ? JSON.parse(dimensions) : {},
      weight: weight ? JSON.parse(weight) : {},
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      images,
      metaTitle,
      metaDescription,
      isFeatured: isFeatured === 'true',
      status: 'draft'
    });

    await product.save();

    // Update category product count
    await ProductCategory.findByIdAndUpdate(category, {
      $inc: { productCount: 1 }
    });

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({
      success: false,
      message: "Error while creating product",
      error: error.message
    });
  }
};

// Update product (admin only)
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    // Handle SKU update
    if (updateData.sku && updateData.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingSku) {
        return res.status(409).send({
          success: false,
          message: "Product with this SKU already exists"
        });
      }
      updateData.sku = updateData.sku.toUpperCase();
    }

    // Handle category update
    if (updateData.category && updateData.category !== product.category.toString()) {
      const categoryExists = await ProductCategory.findById(updateData.category);
      if (!categoryExists) {
        return res.status(404).send({
          success: false,
          message: "Category not found"
        });
      }

      // Update product counts
      await ProductCategory.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      await ProductCategory.findByIdAndUpdate(updateData.category, { $inc: { productCount: 1 } });
    }

    // Handle image uploads if provided
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const newImages = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const uploadResult = await supabaseStorage.uploadFile(file, 'products');

        if (uploadResult.success) {
          newImages.push({
            url: uploadResult.url,
            alt: `${updateData.name || product.name} - Image ${i + 1}`,
            isPrimary: i === 0 && product.images.length === 0,
            sortOrder: product.images.length + i
          });
        }
      }

      updateData.images = [...product.images, ...newImages];
    }

    // Parse JSON fields if they're strings
    ['variants', 'inventory', 'specifications', 'dimensions', 'weight'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // Keep original value if parsing fails
        }
      }
    });

    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    // Convert numeric fields
    ['price', 'comparePrice'].forEach(field => {
      if (updateData[field]) {
        updateData[field] = Number(updateData[field]);
      }
    });

    // Convert boolean fields
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug description');

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating product",
      error: error.message
    });
  }
};

// Delete product (admin only)
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    // Update category product count
    await ProductCategory.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });

    await Product.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error: error.message
    });
  }
};

// Update product status (admin only)
export const updateProductStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVisible, isFeatured } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Product status updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating product status",
      error: error.message
    });
  }
};

// Update product inventory (admin only)
export const updateProductInventoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reservedQuantity, lowStockThreshold, allowBackorder } = req.body;

    const updateData = {};
    if (quantity !== undefined) updateData['inventory.quantity'] = Number(quantity);
    if (reservedQuantity !== undefined) updateData['inventory.reservedQuantity'] = Number(reservedQuantity);
    if (lowStockThreshold !== undefined) updateData['inventory.lowStockThreshold'] = Number(lowStockThreshold);
    if (allowBackorder !== undefined) updateData['inventory.allowBackorder'] = allowBackorder;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Product inventory updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product inventory:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating product inventory",
      error: error.message
    });
  }
};

// Bulk update products (admin only)
export const bulkUpdateProductsController = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Product IDs array is required"
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData,
      { runValidators: true }
    );

    res.status(200).send({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    res.status(500).send({
      success: false,
      message: "Error while bulk updating products",
      error: error.message
    });
  }
};

// Get product statistics (admin only)
export const getProductStatsController = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const lowStockProducts = await Product.countDocuments({
      'inventory.trackQuantity': true,
      $expr: {
        $lte: [
          { $subtract: ['$inventory.quantity', '$inventory.reservedQuantity'] },
          '$inventory.lowStockThreshold'
        ]
      }
    });

    const topSellingProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(5)
      .populate('category', 'name');

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name');

    res.status(200).send({
      success: true,
      message: "Product statistics fetched successfully",
      stats: {
        totalProducts,
        activeProducts,
        featuredProducts,
        lowStockProducts,
        topSellingProducts,
        recentProducts
      }
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching product statistics",
      error: error.message
    });
  }
};
