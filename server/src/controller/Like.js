import Like from "../models/Like.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

// Toggle like for a blog
export const toggleBlogLikeController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id || req.user.id;
    
    // Extract metadata from request
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      platform: req.get('X-Platform') || 'web',
      source: req.get('X-Source') || 'web'
    };

    // Validate blog exists and is published
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    if (blog.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: "Cannot like unpublished blog"
      });
    }

    // Toggle like using static method
    const result = await Like.toggleBlogLike(userId, blogId, metadata);
    
    // Get updated likes count
    const likesCount = await Like.getLikesCount(blogId);

    res.status(200).json({
      success: true,
      message: result.message,
      liked: result.liked,
      likesCount
    });
  } catch (error) {
    console.error("Error toggling blog like:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling blog like",
      error: error.message
    });
  }
};

// Get likes for a blog
export const getBlogLikesController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = -1 
    } = req.query;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Get likes with user details
    const likes = await Like.getBlogLikes(blogId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    });

    // Get total likes count
    const totalLikes = await Like.getLikesCount(blogId);

    res.status(200).json({
      success: true,
      message: "Blog likes fetched successfully",
      likes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLikes / limit),
        totalLikes,
        hasMore: page * limit < totalLikes
      }
    });
  } catch (error) {
    console.error("Error fetching blog likes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog likes",
      error: error.message
    });
  }
};

// Check if user liked a blog
export const checkBlogLikeStatusController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id || req.user.id;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Check if user liked the blog
    const isLiked = await Like.isLikedByUser(userId, blogId);
    const likesCount = await Like.getLikesCount(blogId);

    res.status(200).json({
      success: true,
      message: "Like status fetched successfully",
      liked: isLiked,
      likesCount
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking like status",
      error: error.message
    });
  }
};

// Get user's liked blogs
export const getUserLikedBlogsController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = -1 
    } = req.query;

    // Get user's liked blogs
    const likedBlogs = await Like.getUserLikedBlogs(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    });

    // Filter out likes where blog is null (deleted/unpublished blogs)
    const validLikedBlogs = likedBlogs.filter(like => like.blog !== null);

    // Get total count for pagination
    const totalLikes = await Like.countDocuments({ 
      user: userId, 
      contentType: "blog" 
    });

    res.status(200).json({
      success: true,
      message: "User liked blogs fetched successfully",
      likedBlogs: validLikedBlogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLikes / limit),
        totalLikes,
        hasMore: page * limit < totalLikes
      }
    });
  } catch (error) {
    console.error("Error fetching user liked blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user liked blogs",
      error: error.message
    });
  }
};

// Get top liked blogs
export const getTopLikedBlogsController = async (req, res) => {
  try {
    const { 
      limit = 10, 
      timeframe = null, 
      category = null 
    } = req.query;

    // Get top liked blogs
    const topBlogs = await Like.getTopLikedBlogs({
      limit: parseInt(limit),
      timeframe,
      category
    });

    res.status(200).json({
      success: true,
      message: "Top liked blogs fetched successfully",
      blogs: topBlogs
    });
  } catch (error) {
    console.error("Error fetching top liked blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top liked blogs",
      error: error.message
    });
  }
};

// Get likes analytics for a blog (admin only)
export const getBlogLikesAnalyticsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Set default date range if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Get analytics data
    const analytics = await Like.getLikesAnalytics(blogId, start, end);

    res.status(200).json({
      success: true,
      message: "Blog likes analytics fetched successfully",
      analytics,
      dateRange: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    console.error("Error fetching likes analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching likes analytics",
      error: error.message
    });
  }
};

// Get multiple blogs like status for user
export const getMultipleBlogsLikeStatusController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { blogIds } = req.body;

    if (!blogIds || !Array.isArray(blogIds)) {
      return res.status(400).json({
        success: false,
        message: "Blog IDs array is required"
      });
    }

    // Validate blog IDs
    const validBlogIds = blogIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validBlogIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid blog IDs provided"
      });
    }

    // Get user's likes for these blogs
    const userLikes = await Like.find({
      user: userId,
      blog: { $in: validBlogIds }
    }).select('blog');

    // Get likes count for each blog
    const likesCountPromises = validBlogIds.map(async (blogId) => {
      const count = await Like.getLikesCount(blogId);
      return { blogId, likesCount: count };
    });

    const likesCounts = await Promise.all(likesCountPromises);

    // Create response object
    const blogLikeStatus = validBlogIds.map(blogId => {
      const isLiked = userLikes.some(like => like.blog.toString() === blogId);
      const likesData = likesCounts.find(item => item.blogId === blogId);
      
      return {
        blogId,
        liked: isLiked,
        likesCount: likesData ? likesData.likesCount : 0
      };
    });

    res.status(200).json({
      success: true,
      message: "Blogs like status fetched successfully",
      blogLikeStatus
    });
  } catch (error) {
    console.error("Error fetching multiple blogs like status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs like status",
      error: error.message
    });
  }
};
