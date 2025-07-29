import Bookmark from "../models/Bookmark.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

// Toggle bookmark for a blog
export const toggleBlogBookmarkController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id || req.user.id;
    const { collection, notes, tags, priority } = req.body;
    
    // Extract metadata from request
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      platform: req.get('X-Platform') || 'web',
      source: req.get('X-Source') || 'web',
      referrer: req.get('Referer')
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
        message: "Cannot bookmark unpublished blog"
      });
    }

    // Toggle bookmark using static method
    const result = await Bookmark.toggleBookmark(userId, blogId, {
      collection,
      notes,
      tags,
      priority,
      metadata
    });

    res.status(200).json({
      success: true,
      message: result.message,
      bookmarked: result.bookmarked,
      bookmark: result.bookmark || null
    });
  } catch (error) {
    console.error("Error toggling blog bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling blog bookmark",
      error: error.message
    });
  }
};

// Check if user bookmarked a blog
export const checkBlogBookmarkStatusController = async (req, res) => {
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

    // Check if user bookmarked the blog
    const isBookmarked = await Bookmark.isBookmarkedByUser(userId, blogId);

    res.status(200).json({
      success: true,
      message: "Bookmark status fetched successfully",
      bookmarked: isBookmarked
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking bookmark status",
      error: error.message
    });
  }
};

// Get user's bookmarks
export const getUserBookmarksController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = -1,
      collection = null,
      readingStatus = null,
      priority = null,
      tags = null,
      search = null
    } = req.query;

    // Parse tags if provided
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : null;

    // Get user's bookmarks
    const bookmarks = await Bookmark.getUserBookmarks(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder),
      collection,
      readingStatus,
      priority,
      tags: parsedTags,
      search
    });

    // Get total count for pagination
    let countQuery = { user: userId };
    if (collection && collection !== 'all') countQuery.collection = collection;
    if (readingStatus && readingStatus !== 'all') countQuery.readingStatus = readingStatus;
    if (priority && priority !== 'all') countQuery.priority = priority;
    if (parsedTags && parsedTags.length > 0) countQuery.tags = { $in: parsedTags };

    const totalBookmarks = await Bookmark.countDocuments(countQuery);

    res.status(200).json({
      success: true,
      message: "User bookmarks fetched successfully",
      bookmarks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookmarks / limit),
        totalBookmarks,
        hasMore: page * limit < totalBookmarks
      }
    });
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user bookmarks",
      error: error.message
    });
  }
};

// Get user's bookmark collections
export const getUserBookmarkCollectionsController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get user's collections
    const collections = await Bookmark.getUserCollections(userId);

    res.status(200).json({
      success: true,
      message: "User bookmark collections fetched successfully",
      collections
    });
  } catch (error) {
    console.error("Error fetching bookmark collections:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookmark collections",
      error: error.message
    });
  }
};

// Get user's bookmark statistics
export const getUserBookmarkStatsController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get bookmark statistics
    const stats = await Bookmark.getUserBookmarkStats(userId);

    res.status(200).json({
      success: true,
      message: "User bookmark statistics fetched successfully",
      stats
    });
  } catch (error) {
    console.error("Error fetching bookmark statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookmark statistics",
      error: error.message
    });
  }
};

// Update bookmark details
export const updateBookmarkController = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user._id || req.user.id;
    const { collection, notes, tags, priority, readingStatus } = req.body;

    // Find bookmark
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    // Check if user owns the bookmark
    if (bookmark.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own bookmarks"
      });
    }

    // Update bookmark fields
    if (collection !== undefined) bookmark.collection = collection;
    if (notes !== undefined) bookmark.notes = notes;
    if (tags !== undefined) bookmark.tags = Array.isArray(tags) ? tags : [];
    if (priority !== undefined) bookmark.priority = priority;
    if (readingStatus !== undefined) bookmark.readingStatus = readingStatus;

    await bookmark.save();

    // Populate blog details for response
    await bookmark.populate('blog', 'title slug excerpt featuredImage category publishDate readTime');

    res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      bookmark
    });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Error updating bookmark",
      error: error.message
    });
  }
};

// Update reading progress
export const updateReadingProgressController = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user._id || req.user.id;
    const { percentage, timeSpent = 0 } = req.body;

    // Validate percentage
    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Reading percentage must be between 0 and 100"
      });
    }

    // Find bookmark
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    // Check if user owns the bookmark
    if (bookmark.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own bookmarks"
      });
    }

    // Update reading progress using instance method
    await bookmark.updateReadingProgress(percentage, timeSpent);

    res.status(200).json({
      success: true,
      message: "Reading progress updated successfully",
      readingProgress: bookmark.readingProgress,
      readingStatus: bookmark.readingStatus
    });
  } catch (error) {
    console.error("Error updating reading progress:", error);
    res.status(500).json({
      success: false,
      message: "Error updating reading progress",
      error: error.message
    });
  }
};

// Add tags to bookmark
export const addBookmarkTagsController = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user._id || req.user.id;
    const { tags } = req.body;

    if (!tags || (!Array.isArray(tags) && typeof tags !== 'string')) {
      return res.status(400).json({
        success: false,
        message: "Tags must be provided as array or string"
      });
    }

    // Find bookmark
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    // Check if user owns the bookmark
    if (bookmark.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own bookmarks"
      });
    }

    // Add tags using instance method
    await bookmark.addTags(tags);

    res.status(200).json({
      success: true,
      message: "Tags added successfully",
      tags: bookmark.tags
    });
  } catch (error) {
    console.error("Error adding bookmark tags:", error);
    res.status(500).json({
      success: false,
      message: "Error adding bookmark tags",
      error: error.message
    });
  }
};

// Remove tags from bookmark
export const removeBookmarkTagsController = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user._id || req.user.id;
    const { tags } = req.body;

    if (!tags || (!Array.isArray(tags) && typeof tags !== 'string')) {
      return res.status(400).json({
        success: false,
        message: "Tags must be provided as array or string"
      });
    }

    // Find bookmark
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    // Check if user owns the bookmark
    if (bookmark.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own bookmarks"
      });
    }

    // Remove tags using instance method
    await bookmark.removeTags(tags);

    res.status(200).json({
      success: true,
      message: "Tags removed successfully",
      tags: bookmark.tags
    });
  } catch (error) {
    console.error("Error removing bookmark tags:", error);
    res.status(500).json({
      success: false,
      message: "Error removing bookmark tags",
      error: error.message
    });
  }
};
