import Community from "../models/Community.js";
import { v2 as cloudinary } from "cloudinary";

// Get all community items (public)
export const getAllCommunityController = async (req, res) => {
  try {
    const { 
      type, 
      category, 
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
    if (type && type !== "all") {
      query.type = type;
    }
    if (category && category !== "all") {
      query.category = category;
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

    const communityItems = await Community.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Community items retrieved successfully",
      community: communityItems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching community items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community items",
      error: error.message
    });
  }
};

// Get all community items for admin (includes all statuses)
export const getAllCommunityAdminController = async (req, res) => {
  try {
    const communityItems = await Community.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Community items retrieved successfully",
      community: communityItems,
      count: communityItems.length
    });
  } catch (error) {
    console.error("Error fetching community items for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community items",
      error: error.message
    });
  }
};

// Get featured community items (public)
export const getFeaturedCommunityController = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredItems = await Community.find({
      status: "published",
      featured: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Featured community items retrieved successfully",
      community: featuredItems,
      count: featuredItems.length
    });
  } catch (error) {
    console.error("Error fetching featured community items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured community items",
      error: error.message
    });
  }
};

// Get testimonials (public)
export const getTestimonialsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const testimonials = await Community.find({
      status: "published",
      type: "testimonial"
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Testimonials retrieved successfully",
      testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
      error: error.message
    });
  }
};

// Get single community item by slug (public)
export const getCommunityItemController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const communityItem = await Community.findOne({ 
      slug, 
      status: "published" 
    }).select('-__v');

    if (!communityItem) {
      return res.status(404).json({
        success: false,
        message: "Community item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Community item retrieved successfully",
      community: communityItem
    });
  } catch (error) {
    console.error("Error fetching community item:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community item",
      error: error.message
    });
  }
};

// Get single community item by ID (admin)
export const getCommunityItemByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const communityItem = await Community.findById(id).select('-__v');

    if (!communityItem) {
      return res.status(404).json({
        success: false,
        message: "Community item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Community item retrieved successfully",
      community: communityItem
    });
  } catch (error) {
    console.error("Error fetching community item:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community item",
      error: error.message
    });
  }
};

// Create community item (admin only)
export const createCommunityController = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category = "general",
      content,
      participants,
      timeline,
      location,
      impact,
      tags,
      featured = false,
      priority = "medium",
      status = "draft",
      visibility = "public"
    } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and type are required"
      });
    }

    // Parse JSON fields if they're strings
    let parsedContent, parsedParticipants, parsedTimeline, parsedLocation, parsedImpact, parsedTags;
    
    try {
      parsedContent = content ? (typeof content === 'string' ? JSON.parse(content) : content) : {};
      parsedParticipants = participants ? (typeof participants === 'string' ? JSON.parse(participants) : participants) : {};
      parsedTimeline = timeline ? (typeof timeline === 'string' ? JSON.parse(timeline) : timeline) : {};
      parsedLocation = location ? (typeof location === 'string' ? JSON.parse(location) : location) : {};
      parsedImpact = impact ? (typeof impact === 'string' ? JSON.parse(impact) : impact) : {};
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in request data"
      });
    }

    // Handle multiple image uploads
    let mediaImages = [];
    if (req.files) {
      const imageFields = Object.keys(req.files).filter(key => key.startsWith('image'));
      
      for (const field of imageFields) {
        try {
          const result = await cloudinary.uploader.upload(req.files[field].tempFilePath, {
            folder: "mcan/community"
          });
          mediaImages.push({
            url: result.secure_url,
            caption: req.body[`${field}_caption`] || "",
            isPrimary: field === 'image0' // First image is primary
          });
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
        }
      }
    }

    // Handle participant image uploads
    if (parsedParticipants.featured) {
      for (let i = 0; i < parsedParticipants.featured.length; i++) {
        const participantImageField = `participant_${i}_image`;
        if (req.files?.[participantImageField]) {
          try {
            const result = await cloudinary.uploader.upload(req.files[participantImageField].tempFilePath, {
              folder: "mcan/community/participants"
            });
            parsedParticipants.featured[i].image = result.secure_url;
          } catch (uploadError) {
            console.error(`Error uploading participant image ${i}:`, uploadError);
          }
        }
      }
    }

    // Create new community item
    const newCommunityItem = new Community({
      title,
      description,
      type,
      category,
      content: parsedContent,
      participants: parsedParticipants,
      timeline: parsedTimeline,
      location: parsedLocation,
      media: {
        images: mediaImages,
        videos: [],
        documents: []
      },
      impact: parsedImpact,
      tags: parsedTags,
      featured: featured === 'true' || featured === true,
      priority,
      status,
      visibility
    });

    await newCommunityItem.save();

    res.status(201).json({
      success: true,
      message: "Community item created successfully",
      community: newCommunityItem
    });
  } catch (error) {
    console.error("Error creating community item:", error);
    res.status(500).json({
      success: false,
      message: "Error creating community item",
      error: error.message
    });
  }
};

// Update community item (admin only)
export const updateCommunityController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing community item
    const existingItem = await Community.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Community item not found"
      });
    }

    // Handle image uploads if provided
    if (req.files) {
      const imageFields = Object.keys(req.files).filter(key => key.startsWith('image'));
      let newImages = [...(existingItem.media?.images || [])];
      
      for (const field of imageFields) {
        try {
          const result = await cloudinary.uploader.upload(req.files[field].tempFilePath, {
            folder: "mcan/community"
          });
          newImages.push({
            url: result.secure_url,
            caption: req.body[`${field}_caption`] || "",
            isPrimary: newImages.length === 0 // First image is primary
          });
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
        }
      }
      
      if (!updateData.media) updateData.media = {};
      updateData.media.images = newImages;
    }

    // Parse JSON fields if they're strings
    ['content', 'participants', 'timeline', 'location', 'impact', 'tags'].forEach(field => {
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

    // Parse date fields
    if (updateData.timeline?.startDate) {
      updateData.timeline.startDate = new Date(updateData.timeline.startDate);
    }
    if (updateData.timeline?.endDate) {
      updateData.timeline.endDate = new Date(updateData.timeline.endDate);
    }

    // Update community item
    const updatedItem = await Community.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Community item updated successfully",
      community: updatedItem
    });
  } catch (error) {
    console.error("Error updating community item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating community item",
      error: error.message
    });
  }
};

// Delete community item (admin only)
export const deleteCommunityController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Community.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Community item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Community item deleted successfully",
      community: deletedItem
    });
  } catch (error) {
    console.error("Error deleting community item:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting community item",
      error: error.message
    });
  }
};
