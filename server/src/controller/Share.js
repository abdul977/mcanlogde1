import Share from "../models/Share.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

// Record a blog share
export const recordBlogShareController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id || req.user.id;
    const { 
      platform, 
      shareMethod = "direct", 
      shareContext = {},
      shareSuccess = true,
      errorInfo = null
    } = req.body;

    // Validate required fields
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Share platform is required"
      });
    }

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
        message: "Cannot share unpublished blog"
      });
    }

    // Extract metadata from request
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      platform: req.get('X-Platform') || 'web',
      source: req.get('X-Source') || 'web',
      referrer: req.get('Referer'),
      deviceType: req.get('X-Device-Type') || 'desktop',
      browser: req.get('X-Browser'),
      operatingSystem: req.get('X-OS')
    };

    // Record share using static method
    const result = await Share.recordShare({
      userId,
      blogId,
      platform,
      shareMethod,
      metadata,
      shareContext,
      shareSuccess,
      errorInfo
    });

    // Get updated share count
    const shareCount = await Share.getShareCount(blogId);

    res.status(201).json({
      success: true,
      message: result.message,
      shareId: result.shareId,
      shareCount
    });
  } catch (error) {
    console.error("Error recording blog share:", error);
    res.status(500).json({
      success: false,
      message: "Error recording blog share",
      error: error.message
    });
  }
};

// Get share count for a blog
export const getBlogShareCountController = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Get share count
    const shareCount = await Share.getShareCount(blogId);

    res.status(200).json({
      success: true,
      message: "Share count fetched successfully",
      shareCount
    });
  } catch (error) {
    console.error("Error fetching share count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching share count",
      error: error.message
    });
  }
};

// Get share analytics for a blog (admin only)
export const getBlogShareAnalyticsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { 
      startDate, 
      endDate, 
      groupBy = "platform" 
    } = req.query;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Get analytics data
    const analytics = await Share.getBlogShareAnalytics(blogId, {
      startDate,
      endDate,
      groupBy
    });

    res.status(200).json({
      success: true,
      message: "Blog share analytics fetched successfully",
      analytics,
      groupBy,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    console.error("Error fetching share analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching share analytics",
      error: error.message
    });
  }
};

// Get top shared blogs
export const getTopSharedBlogsController = async (req, res) => {
  try {
    const { 
      limit = 10, 
      timeframe = null, 
      platform = null 
    } = req.query;

    // Get top shared blogs
    const topBlogs = await Share.getTopSharedBlogs({
      limit: parseInt(limit),
      timeframe,
      platform
    });

    res.status(200).json({
      success: true,
      message: "Top shared blogs fetched successfully",
      blogs: topBlogs,
      filters: {
        limit: parseInt(limit),
        timeframe,
        platform
      }
    });
  } catch (error) {
    console.error("Error fetching top shared blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top shared blogs",
      error: error.message
    });
  }
};

// Get user's share history
export const getUserShareHistoryController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      platform = null, 
      successOnly = true 
    } = req.query;

    // Get user's share history
    const shareHistory = await Share.getUserShareHistory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      platform,
      successOnly: successOnly === 'true'
    });

    // Get total count for pagination
    let countQuery = { user: userId };
    if (platform) countQuery.platform = platform;
    if (successOnly === 'true') countQuery.shareSuccess = true;

    const totalShares = await Share.countDocuments(countQuery);

    res.status(200).json({
      success: true,
      message: "User share history fetched successfully",
      shareHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalShares / limit),
        totalShares,
        hasMore: page * limit < totalShares
      }
    });
  } catch (error) {
    console.error("Error fetching user share history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user share history",
      error: error.message
    });
  }
};

// Get platform usage statistics (admin only)
export const getPlatformStatsController = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      source = null 
    } = req.query;

    // Get platform statistics
    const platformStats = await Share.getPlatformStats({
      startDate,
      endDate,
      source
    });

    res.status(200).json({
      success: true,
      message: "Platform statistics fetched successfully",
      platformStats,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        source
      }
    });
  } catch (error) {
    console.error("Error fetching platform statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching platform statistics",
      error: error.message
    });
  }
};

// Get sharing trends (admin only)
export const getSharingTrendsController = async (req, res) => {
  try {
    const { 
      timeframe = 'month', // 'week', 'month', 'year'
      platform = null 
    } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build aggregation pipeline for trends
    let matchStage = {
      shareSuccess: true,
      createdAt: { $gte: startDate }
    };

    if (platform) {
      matchStage.platform = platform;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          shareCount: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
          uniqueBlogs: { $addToSet: "$blog" },
          platforms: { $addToSet: "$platform" }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          shareCount: 1,
          uniqueUsersCount: { $size: "$uniqueUsers" },
          uniqueBlogsCount: { $size: "$uniqueBlogs" },
          platformsUsed: "$platforms"
        }
      },
      { $sort: { date: 1 } }
    ];

    const trends = await Share.aggregate(pipeline);

    res.status(200).json({
      success: true,
      message: "Sharing trends fetched successfully",
      trends,
      filters: {
        timeframe,
        platform,
        dateRange: {
          startDate,
          endDate: now
        }
      }
    });
  } catch (error) {
    console.error("Error fetching sharing trends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sharing trends",
      error: error.message
    });
  }
};

// Get share summary for multiple blogs
export const getMultipleBlogsShareSummaryController = async (req, res) => {
  try {
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

    // Get share counts for each blog
    const shareCountPromises = validBlogIds.map(async (blogId) => {
      const count = await Share.getShareCount(blogId);
      return { blogId, shareCount: count };
    });

    const shareCounts = await Promise.all(shareCountPromises);

    res.status(200).json({
      success: true,
      message: "Blogs share summary fetched successfully",
      blogShareSummary: shareCounts
    });
  } catch (error) {
    console.error("Error fetching multiple blogs share summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs share summary",
      error: error.message
    });
  }
};
