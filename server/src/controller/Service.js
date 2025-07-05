import Service from "../models/Service.js";
import supabaseStorage from "../services/supabaseStorage.js";

// Get all services (public)
export const getAllServicesController = async (req, res) => {
  try {
    const { category, status = "active" } = req.query;
    
    let query = { status };
    if (category && category !== "all") {
      query.category = category;
    }

    const services = await Service.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      services,
      count: services.length
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message
    });
  }
};

// Get all services for admin (includes all statuses)
export const getAllServicesAdminController = async (req, res) => {
  try {
    const services = await Service.find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      services,
      count: services.length
    });
  } catch (error) {
    console.error("Error fetching services for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message
    });
  }
};

// Get single service by slug (public)
export const getServiceController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const service = await Service.findOne({ 
      slug, 
      status: "active" 
    }).select('-__v');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      service
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching service",
      error: error.message
    });
  }
};

// Get single service by ID (admin)
export const getServiceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findById(id).select('-__v');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      service
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching service",
      error: error.message
    });
  }
};

// Create service (admin only)
export const createServiceController = async (req, res) => {
  try {
    const {
      title,
      description,
      icon,
      features,
      category,
      status = "active",
      displayOrder = 0,
      contactInfo,
      eligibility,
      requirements,
      applicationProcess
    } = req.body;

    // Validate required fields
    if (!title || !description || !features) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and features are required"
      });
    }

    // Parse features if it's a string
    let parsedFeatures;
    try {
      parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid features format"
      });
    }

    // Handle optional image upload
    let imageUrl = null;
    if (req.files?.image) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.image,
          'mcan-services',
          'services'
        );

        if (result.success) {
          imageUrl = result.data.secure_url;
        } else {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Parse contact info, eligibility, and requirements if they're strings
    let parsedContactInfo = {};
    let parsedEligibility = [];
    let parsedRequirements = [];

    try {
      if (contactInfo) {
        parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
      }
      if (eligibility) {
        parsedEligibility = typeof eligibility === 'string' ? JSON.parse(eligibility) : eligibility;
      }
      if (requirements) {
        parsedRequirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in request data"
      });
    }

    // Create new service
    const newService = new Service({
      title,
      description,
      icon: icon || "FaHandsHelping",
      features: parsedFeatures,
      image: imageUrl,
      category,
      status,
      displayOrder: parseInt(displayOrder) || 0,
      contactInfo: parsedContactInfo,
      eligibility: parsedEligibility,
      requirements: parsedRequirements,
      applicationProcess
    });

    await newService.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "Error creating service",
      error: error.message
    });
  }
};

// Update service (admin only)
export const updateServiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing service
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    // Handle image upload if provided
    if (req.files?.image) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.image,
          'mcan-services',
          'services'
        );

        if (result.success) {
          updateData.image = result.data.secure_url;
        } else {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Parse JSON fields if they're strings
    ['features', 'contactInfo', 'eligibility', 'requirements'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Error updating service",
      error: error.message
    });
  }
};

// Delete service (admin only)
export const deleteServiceController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);
    
    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      service: deletedService
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message
    });
  }
};

// Get services by category (public)
export const getServicesByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    
    const services = await Service.find({ 
      category, 
      status: "active" 
    })
    .sort({ displayOrder: 1, createdAt: -1 })
    .select('-__v');

    res.status(200).json({
      success: true,
      message: `${category} services retrieved successfully`,
      services,
      count: services.length
    });
  } catch (error) {
    console.error("Error fetching services by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message
    });
  }
};
