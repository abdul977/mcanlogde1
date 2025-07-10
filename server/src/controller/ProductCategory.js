import ProductCategory from "../models/ProductCategory.js";
import Product from "../models/Product.js";
import supabaseStorage from "../services/supabaseStorage.js";
import slug from "slugify";

// Get all product categories (public)
export const getAllProductCategoriesController = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    
    const query = includeInactive === 'true' ? {} : { isActive: true, isVisible: true };
    
    const categories = await ProductCategory.find(query)
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).send({
      success: true,
      message: "Product categories fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting product categories",
      error: error.message
    });
  }
};

// Get single product category by slug (public)
export const getProductCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await ProductCategory.findOne({ 
      slug, 
      isActive: true, 
      isVisible: true 
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Category fetched successfully",
      category
    });
  } catch (error) {
    console.error("Error fetching product category:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting product category",
      error: error.message
    });
  }
};

// Get featured categories (public)
export const getFeaturedCategoriesController = async (req, res) => {
  try {
    const categories = await ProductCategory.findFeatured()
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).send({
      success: true,
      message: "Featured categories fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error fetching featured categories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting featured categories",
      error: error.message
    });
  }
};

// Get menu categories (public)
export const getMenuCategoriesController = async (req, res) => {
  try {
    const categories = await ProductCategory.findMenuCategories();

    res.status(200).send({
      success: true,
      message: "Menu categories fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting menu categories",
      error: error.message
    });
  }
};

// Get homepage categories (public)
export const getHomepageCategoriesController = async (req, res) => {
  try {
    const categories = await ProductCategory.findHomepageCategories();

    res.status(200).send({
      success: true,
      message: "Homepage categories fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error fetching homepage categories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting homepage categories",
      error: error.message
    });
  }
};

// Get root categories (public)
export const getRootCategoriesController = async (req, res) => {
  try {
    const categories = await ProductCategory.findRootCategories();

    res.status(200).send({
      success: true,
      message: "Root categories fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error fetching root categories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting root categories",
      error: error.message
    });
  }
};

// Get subcategories (public)
export const getSubcategoriesController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategories = await ProductCategory.findByParent(id);

    res.status(200).send({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting subcategories",
      error: error.message
    });
  }
};

// Create product category (admin only)
export const createProductCategoryController = async (req, res) => {
  try {
    const {
      name,
      description,
      parent,
      icon,
      color,
      isActive,
      isVisible,
      isFeatured,
      displayOrder,
      showInMenu,
      showOnHomepage,
      metaTitle,
      metaDescription,
      attributes
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).send({
        success: false,
        message: "Name and description are required"
      });
    }

    // Check if category name already exists
    const existingCategory = await ProductCategory.findOne({ name });
    if (existingCategory) {
      return res.status(409).send({
        success: false,
        message: "Category with this name already exists"
      });
    }

    // Validate parent category if provided
    if (parent) {
      const parentCategory = await ProductCategory.findById(parent);
      if (!parentCategory) {
        return res.status(404).send({
          success: false,
          message: "Parent category not found"
        });
      }
      
      // Check depth limit
      if (parentCategory.level >= 2) {
        return res.status(400).send({
          success: false,
          message: "Maximum category depth exceeded"
        });
      }
    }

    // Handle image upload if provided
    let image = null;
    if (req.files && req.files.image) {
      const uploadResult = await supabaseStorage.uploadFile(req.files.image, 'categories');
      if (uploadResult.success) {
        image = uploadResult.url;
      }
    }

    // Create category
    const category = new ProductCategory({
      name,
      description,
      parent: parent || null,
      icon: icon || 'shopping-bag',
      image,
      color: color || '#3B82F6',
      isActive: isActive !== undefined ? isActive : true,
      isVisible: isVisible !== undefined ? isVisible : true,
      isFeatured: isFeatured || false,
      displayOrder: displayOrder || 0,
      showInMenu: showInMenu !== undefined ? showInMenu : true,
      showOnHomepage: showOnHomepage || false,
      metaTitle,
      metaDescription,
      attributes: attributes ? JSON.parse(attributes) : []
    });

    await category.save();

    res.status(201).send({
      success: true,
      message: "Product category created successfully",
      category
    });
  } catch (error) {
    console.error("Error creating product category:", error);
    res.status(500).send({
      success: false,
      message: "Error while creating product category",
      error: error.message
    });
  }
};

// Update product category (admin only)
export const updateProductCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate category exists
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }

    // Handle name update
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await ProductCategory.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(409).send({
          success: false,
          message: "Category with this name already exists"
        });
      }
    }

    // Handle parent update
    if (updateData.parent && updateData.parent !== category.parent?.toString()) {
      const parentCategory = await ProductCategory.findById(updateData.parent);
      if (!parentCategory) {
        return res.status(404).send({
          success: false,
          message: "Parent category not found"
        });
      }
      
      // Check for circular reference
      if (updateData.parent === id) {
        return res.status(400).send({
          success: false,
          message: "Category cannot be its own parent"
        });
      }
      
      // Check depth limit
      if (parentCategory.level >= 2) {
        return res.status(400).send({
          success: false,
          message: "Maximum category depth exceeded"
        });
      }
    }

    // Handle image upload if provided
    if (req.files && req.files.image) {
      const uploadResult = await supabaseStorage.uploadFile(req.files.image, 'categories');
      if (uploadResult.success) {
        updateData.image = uploadResult.url;
      }
    }

    // Parse attributes if it's a string
    if (updateData.attributes && typeof updateData.attributes === 'string') {
      try {
        updateData.attributes = JSON.parse(updateData.attributes);
      } catch (e) {
        // Keep original value if parsing fails
      }
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).send({
      success: true,
      message: "Product category updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Error updating product category:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating product category",
      error: error.message
    });
  }
};

// Delete product category (admin only)
export const deleteProductCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete category. It has ${productCount} products. Please move or delete the products first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await ProductCategory.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategories. Please move or delete the subcategories first.`
      });
    }

    await ProductCategory.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Product category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product category:", error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product category",
      error: error.message
    });
  }
};

// Get category statistics (admin only)
export const getCategoryStatsController = async (req, res) => {
  try {
    const totalCategories = await ProductCategory.countDocuments();
    const activeCategories = await ProductCategory.countDocuments({ isActive: true });
    const featuredCategories = await ProductCategory.countDocuments({ isFeatured: true });
    const rootCategories = await ProductCategory.countDocuments({ parent: null });

    // Get categories with product counts
    const categoriesWithProducts = await ProductCategory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: '$products' }
        }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).send({
      success: true,
      message: "Category statistics fetched successfully",
      stats: {
        totalCategories,
        activeCategories,
        featuredCategories,
        rootCategories,
        topCategories: categoriesWithProducts
      }
    });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching category statistics",
      error: error.message
    });
  }
};
