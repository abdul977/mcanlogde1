import Blog from "../models/Blog.js";
import cloudinary from "cloudinary";
import slugify from "slugify";

// Get all blogs (public - only published)
export const getAllBlogsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclude full content for listing

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message
    });
  }
};

// Get all blogs for admin (includes drafts)
export const getAllBlogsAdminController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message
    });
  }
};

// Get single blog by slug
export const getBlogController = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Only allow published blogs for public access
    if (blog.status !== 'published' && !req.user) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message
    });
  }
};

// Get featured blogs
export const getFeaturedBlogsController = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const blogs = await Blog.getFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Featured blogs fetched successfully",
      blogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured blogs",
      error: error.message
    });
  }
};

// Create blog (admin only)
export const createBlogController = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      status = "draft",
      tags,
      category,
      featured = false,
      metaDescription
    } = req.body;

    // Validate required fields
    if (!title || !content || !excerpt) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and excerpt are required"
      });
    }

    // Handle featured image upload
    if (!req.files?.featuredImage) {
      return res.status(400).json({
        success: false,
        message: "Featured image is required"
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.featuredImage.tempFilePath);

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];

    // Create blog
    const blog = new Blog({
      title,
      slug: slugify(title, { lower: true }),
      content,
      excerpt,
      author: author || "MCAN Admin",
      featuredImage: result.secure_url,
      status,
      tags: processedTags,
      category: category || "general",
      featured: featured === 'true' || featured === true,
      metaDescription,
      publishDate: status === 'published' ? new Date() : undefined
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message
    });
  }
};

// Update blog (admin only)
export const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle featured image upload if provided
    if (req.files?.featuredImage) {
      const result = await cloudinary.uploader.upload(req.files.featuredImage.tempFilePath);
      updateData.featuredImage = result.secure_url;
    }

    // Process tags if provided
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    // Update slug if title changed
    if (updateData.title) {
      updateData.slug = slugify(updateData.title, { lower: true });
    }

    // Set publish date if status changed to published
    if (updateData.status === 'published') {
      const currentBlog = await Blog.findById(id);
      if (currentBlog.status !== 'published') {
        updateData.publishDate = new Date();
      }
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message
    });
  }
};

// Delete blog (admin only)
export const deleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message
    });
  }
};
