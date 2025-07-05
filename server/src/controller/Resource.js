import Resource from "../models/Resource.js";
import { v2 as cloudinary } from "cloudinary";

// Get all resources (public)
export const getAllResourcesController = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      difficulty, 
      language, 
      featured, 
      status = "published",
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12
    } = req.query;
    
    let query = { status };
    
    // Build query filters
    if (category && category !== "all") {
      query.category = category;
    }
    if (subcategory) {
      query.subcategory = subcategory;
    }
    if (difficulty && difficulty !== "all") {
      query["metadata.difficulty"] = difficulty;
    }
    if (language && language !== "all") {
      query["metadata.language"] = language;
    }
    if (featured === "true") {
      query.featured = true;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sortObj = {};
    if (search) {
      sortObj.score = { $meta: "textScore" };
    }
    sortObj[sort] = order === "desc" ? -1 : 1;

    const resources = await Resource.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Resource.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Resources retrieved successfully",
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
      error: error.message
    });
  }
};

// Get all resources for admin (includes all statuses)
export const getAllResourcesAdminController = async (req, res) => {
  try {
    const resources = await Resource.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Resources retrieved successfully",
      resources,
      count: resources.length
    });
  } catch (error) {
    console.error("Error fetching resources for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
      error: error.message
    });
  }
};

// Get featured resources (public)
export const getFeaturedResourcesController = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredResources = await Resource.find({
      status: "published",
      featured: true
    })
    .sort({ 'statistics.views': -1, createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Featured resources retrieved successfully",
      resources: featuredResources,
      count: featuredResources.length
    });
  } catch (error) {
    console.error("Error fetching featured resources:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured resources",
      error: error.message
    });
  }
};

// Get popular resources (public)
export const getPopularResourcesController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularResources = await Resource.find({
      status: "published"
    })
    .sort({ 'statistics.views': -1, 'statistics.downloads': -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Popular resources retrieved successfully",
      resources: popularResources,
      count: popularResources.length
    });
  } catch (error) {
    console.error("Error fetching popular resources:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular resources",
      error: error.message
    });
  }
};

// Get single resource by slug (public)
export const getResourceController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const resource = await Resource.findOne({ 
      slug, 
      status: "published" 
    }).select('-__v');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    // Increment view count
    await Resource.findByIdAndUpdate(resource._id, {
      $inc: { 'statistics.views': 1 }
    });

    res.status(200).json({
      success: true,
      message: "Resource retrieved successfully",
      resource
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resource",
      error: error.message
    });
  }
};

// Get single resource by ID (admin)
export const getResourceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id).select('-__v');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource retrieved successfully",
      resource
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resource",
      error: error.message
    });
  }
};

// Create resource (admin only)
export const createResourceController = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      type,
      content,
      author,
      publisher,
      metadata,
      topics,
      tags,
      preview,
      access,
      status = "draft",
      featured = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and type are required"
      });
    }

    // Parse JSON fields if they're strings
    let parsedContent, parsedAuthor, parsedPublisher, parsedMetadata, parsedTopics, parsedTags, parsedPreview, parsedAccess;
    
    try {
      parsedContent = content ? (typeof content === 'string' ? JSON.parse(content) : content) : {};
      parsedAuthor = author ? (typeof author === 'string' ? JSON.parse(author) : author) : {};
      parsedPublisher = publisher ? (typeof publisher === 'string' ? JSON.parse(publisher) : publisher) : {};
      parsedMetadata = metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {};
      parsedTopics = topics ? (typeof topics === 'string' ? JSON.parse(topics) : topics) : [];
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
      parsedPreview = preview ? (typeof preview === 'string' ? JSON.parse(preview) : preview) : {};
      parsedAccess = access ? (typeof access === 'string' ? JSON.parse(access) : access) : {};
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in request data"
      });
    }

    // Handle file upload if provided
    let fileUrl = null;
    let fileSize = null;
    let mimeType = null;
    let fileName = null;

    if (req.files?.file) {
      try {
        const result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
          folder: "mcan/resources",
          resource_type: "auto"
        });
        fileUrl = result.secure_url;
        fileSize = result.bytes;
        mimeType = result.format;
        fileName = req.files.file.name;
        
        parsedContent.fileUrl = fileUrl;
        parsedContent.fileSize = fileSize;
        parsedContent.mimeType = mimeType;
        parsedContent.fileName = fileName;
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading file"
        });
      }
    }

    // Handle thumbnail upload
    let thumbnailUrl = null;
    if (req.files?.thumbnail) {
      try {
        const result = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
          folder: "mcan/resources/thumbnails"
        });
        thumbnailUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Thumbnail upload error:", uploadError);
      }
    }

    // Handle author image upload
    let authorImageUrl = null;
    if (req.files?.authorImage) {
      try {
        const result = await cloudinary.uploader.upload(req.files.authorImage.tempFilePath, {
          folder: "mcan/authors"
        });
        authorImageUrl = result.secure_url;
        parsedAuthor.image = authorImageUrl;
      } catch (uploadError) {
        console.error("Author image upload error:", uploadError);
      }
    }

    // Create new resource
    const newResource = new Resource({
      title,
      description,
      category,
      subcategory,
      type,
      content: parsedContent,
      author: parsedAuthor,
      publisher: parsedPublisher,
      metadata: parsedMetadata,
      topics: parsedTopics,
      tags: parsedTags,
      thumbnail: thumbnailUrl,
      preview: parsedPreview,
      access: parsedAccess,
      status,
      featured: featured === 'true' || featured === true
    });

    await newResource.save();

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      resource: newResource
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({
      success: false,
      message: "Error creating resource",
      error: error.message
    });
  }
};

// Update resource (admin only)
export const updateResourceController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing resource
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    // Handle file upload if provided
    if (req.files?.file) {
      try {
        const result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
          folder: "mcan/resources",
          resource_type: "auto"
        });
        
        if (!updateData.content) updateData.content = {};
        updateData.content.fileUrl = result.secure_url;
        updateData.content.fileSize = result.bytes;
        updateData.content.mimeType = result.format;
        updateData.content.fileName = req.files.file.name;
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading file"
        });
      }
    }

    // Handle thumbnail upload if provided
    if (req.files?.thumbnail) {
      try {
        const result = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
          folder: "mcan/resources/thumbnails"
        });
        updateData.thumbnail = result.secure_url;
      } catch (uploadError) {
        console.error("Thumbnail upload error:", uploadError);
      }
    }

    // Handle author image upload if provided
    if (req.files?.authorImage) {
      try {
        const result = await cloudinary.uploader.upload(req.files.authorImage.tempFilePath, {
          folder: "mcan/authors"
        });
        if (updateData.author) {
          const author = typeof updateData.author === 'string' ? JSON.parse(updateData.author) : updateData.author;
          author.image = result.secure_url;
          updateData.author = author;
        }
      } catch (uploadError) {
        console.error("Author image upload error:", uploadError);
      }
    }

    // Parse JSON fields if they're strings
    ['content', 'author', 'publisher', 'metadata', 'topics', 'tags', 'preview', 'access'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Parse boolean fields
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    // Update resource
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource: updatedResource
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({
      success: false,
      message: "Error updating resource",
      error: error.message
    });
  }
};

// Delete resource (admin only)
export const deleteResourceController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResource = await Resource.findByIdAndDelete(id);
    
    if (!deletedResource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      resource: deletedResource
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting resource",
      error: error.message
    });
  }
};

// Increment download count
export const incrementDownloadController = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { 'statistics.downloads': 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Download count updated",
      downloads: resource.statistics.downloads
    });
  } catch (error) {
    console.error("Error updating download count:", error);
    res.status(500).json({
      success: false,
      message: "Error updating download count",
      error: error.message
    });
  }
};
