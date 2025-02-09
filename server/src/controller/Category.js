import categoryModel from "../models/Category.js";
import slugify from "slugify";
import Post from "../models/Post.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name, description, icon, features, targetGender, requirements, displayOrder } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).send({ 
        success: false,
        message: "Name and description are required" 
      });
    }

    // Check for existing category
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(409).send({
        success: false,
        message: "Accommodation category already exists",
      });
    }

    // Create new category
    const category = await new categoryModel({
      name,
      description,
      icon: icon || "home",
      features,
      targetGender,
      requirements,
      displayOrder,
      slug: slugify(name),
    }).save();

    res.status(201).send({
      success: true,
      message: "New accommodation category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error creating accommodation category",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      icon, 
      features, 
      targetGender, 
      requirements,
      displayOrder,
      isActive 
    } = req.body;

    // Validate at least one field is provided
    if (!Object.keys(req.body).length) {
      return res.status(400).send({
        success: false,
        message: "No update fields provided",
      });
    }

    // Build update object
    const updateData = {
      ...(name && { name, slug: slugify(name) }),
      ...(description && { description }),
      ...(icon && { icon }),
      ...(features && { features }),
      ...(targetGender && { targetGender }),
      ...(requirements && { requirements }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: Date.now(),
    };

    const category = await categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Accommodation category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error updating accommodation category",
    });
  }
};

export const categoryControlller = async (req, res) => {
  try {
    const categories = await categoryModel.find({ isActive: true })
      .sort({ displayOrder: 1 });
      
    res.status(200).send({
      success: true,
      message: "Available accommodation categories",
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error fetching accommodation categories",
    });
  }
};

export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category details retrieved successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error retrieving category details",
    });
  }
};

export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has associated posts
    const hasAssociatedPosts = await Post.exists({ category: id });
    if (hasAssociatedPosts) {
      return res.status(400).send({
        success: false,
        message: "Cannot delete category with existing accommodations. Please remove or reassign accommodations first.",
      });
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Accommodation category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error deleting accommodation category",
      error,
    });
  }
};

export const selectedCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    const accommodations = await Post.find({ category: category._id })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: `Available ${category.name} accommodations`,
      category,
      accommodations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching category accommodations",
      error,
    });
  }
};

// New endpoint to get categories by gender
export const getCategoriesByGenderController = async (req, res) => {
  try {
    const { targetGender } = req.params;
    
    const categories = await categoryModel.find({ 
      isActive: true,
      $or: [
        { targetGender },
        { targetGender: 'any' }
      ]
    }).sort({ displayOrder: 1 });

    res.status(200).send({
      success: true,
      message: `Accommodation categories for ${targetGender}`,
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching gender-specific categories",
      error,
    });
  }
};
