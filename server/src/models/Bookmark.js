import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog reference is required"],
      index: true
    },
    // Optional: Organize bookmarks into collections/folders
    collection: {
      type: String,
      trim: true,
      default: "default",
      maxlength: [50, "Collection name cannot exceed 50 characters"]
    },
    // User notes on the bookmark
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"]
    },
    // Tags for better organization
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, "Tag cannot exceed 30 characters"]
    }],
    // Reading status
    readingStatus: {
      type: String,
      enum: ["to_read", "reading", "completed"],
      default: "to_read"
    },
    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    // Metadata for analytics
    metadata: {
      userAgent: String,
      ipAddress: String,
      platform: String,
      source: {
        type: String,
        enum: ["web", "mobile", "api"],
        default: "web"
      },
      // Track where the bookmark was created from
      referrer: String
    },
    // Reading progress (for future feature)
    readingProgress: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      lastReadAt: Date,
      timeSpent: {
        type: Number, // in seconds
        default: 0
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for performance and uniqueness
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true }); // Prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, createdAt: -1 }); // For user's bookmarks
bookmarkSchema.index({ user: 1, collection: 1, createdAt: -1 }); // For collection-based queries
bookmarkSchema.index({ user: 1, readingStatus: 1, createdAt: -1 }); // For reading status queries
bookmarkSchema.index({ user: 1, priority: 1, createdAt: -1 }); // For priority-based queries
bookmarkSchema.index({ tags: 1 }); // For tag-based searches

// Virtual for formatted creation date
bookmarkSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for reading progress percentage
bookmarkSchema.virtual('progressPercentage').get(function() {
  return this.readingProgress.percentage || 0;
});

// Static method to toggle bookmark for a blog
bookmarkSchema.statics.toggleBookmark = async function(userId, blogId, options = {}) {
  try {
    // Check if bookmark already exists
    const existingBookmark = await this.findOne({ user: userId, blog: blogId });
    
    if (existingBookmark) {
      // Remove bookmark
      await this.deleteOne({ _id: existingBookmark._id });
      return {
        bookmarked: false,
        message: "Blog removed from bookmarks"
      };
    } else {
      // Add bookmark
      const newBookmark = new this({
        user: userId,
        blog: blogId,
        collection: options.collection || "default",
        notes: options.notes || "",
        tags: options.tags || [],
        priority: options.priority || "medium",
        metadata: options.metadata || {}
      });
      await newBookmark.save();
      return {
        bookmarked: true,
        message: "Blog added to bookmarks",
        bookmark: newBookmark
      };
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - bookmark already exists
      throw new Error("Blog is already bookmarked");
    }
    throw error;
  }
};

// Static method to check if user bookmarked a blog
bookmarkSchema.statics.isBookmarkedByUser = async function(userId, blogId) {
  const bookmark = await this.findOne({ user: userId, blog: blogId });
  return !!bookmark;
};

// Static method to get user's bookmarks with filtering and pagination
bookmarkSchema.statics.getUserBookmarks = async function(userId, options = {}) {
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
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  let query = { user: userId };
  
  if (collection && collection !== 'all') {
    query.collection = collection;
  }
  
  if (readingStatus && readingStatus !== 'all') {
    query.readingStatus = readingStatus;
  }
  
  if (priority && priority !== 'all') {
    query.priority = priority;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  // Get bookmarks with populated blog data
  let bookmarksQuery = this.find(query)
    .populate({
      path: 'blog',
      select: 'title slug excerpt featuredImage category publishDate readTime status author',
      match: { status: 'published' } // Only return published blogs
    })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
  const bookmarks = await bookmarksQuery;
  
  // Filter out bookmarks where blog is null (unpublished/deleted blogs)
  const validBookmarks = bookmarks.filter(bookmark => bookmark.blog !== null);
  
  // If search is provided, filter by blog title/content
  if (search && validBookmarks.length > 0) {
    const searchRegex = new RegExp(search, 'i');
    return validBookmarks.filter(bookmark => 
      searchRegex.test(bookmark.blog.title) || 
      searchRegex.test(bookmark.blog.excerpt) ||
      searchRegex.test(bookmark.notes)
    );
  }
  
  return validBookmarks;
};

// Static method to get user's bookmark collections
bookmarkSchema.statics.getUserCollections = async function(userId) {
  const collections = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$collection",
        count: { $sum: 1 },
        lastUpdated: { $max: "$updatedAt" }
      }
    },
    { $sort: { lastUpdated: -1 } }
  ]);
  
  return collections.map(col => ({
    name: col._id,
    count: col.count,
    lastUpdated: col.lastUpdated
  }));
};

// Static method to get bookmark statistics for user
bookmarkSchema.statics.getUserBookmarkStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        toRead: {
          $sum: { $cond: [{ $eq: ["$readingStatus", "to_read"] }, 1, 0] }
        },
        reading: {
          $sum: { $cond: [{ $eq: ["$readingStatus", "reading"] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$readingStatus", "completed"] }, 1, 0] }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
        },
        collections: { $addToSet: "$collection" }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        toRead: 1,
        reading: 1,
        completed: 1,
        highPriority: 1,
        collectionsCount: { $size: "$collections" }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    toRead: 0,
    reading: 0,
    completed: 0,
    highPriority: 0,
    collectionsCount: 0
  };
};

// Instance method to update reading progress
bookmarkSchema.methods.updateReadingProgress = function(percentage, timeSpent = 0) {
  this.readingProgress.percentage = Math.min(100, Math.max(0, percentage));
  this.readingProgress.lastReadAt = new Date();
  this.readingProgress.timeSpent += timeSpent;
  
  // Auto-update reading status based on progress
  if (percentage === 0) {
    this.readingStatus = 'to_read';
  } else if (percentage === 100) {
    this.readingStatus = 'completed';
  } else {
    this.readingStatus = 'reading';
  }
  
  return this.save();
};

// Instance method to add tags
bookmarkSchema.methods.addTags = function(newTags) {
  if (!Array.isArray(newTags)) {
    newTags = [newTags];
  }
  
  newTags.forEach(tag => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !this.tags.includes(cleanTag)) {
      this.tags.push(cleanTag);
    }
  });
  
  return this.save();
};

// Instance method to remove tags
bookmarkSchema.methods.removeTags = function(tagsToRemove) {
  if (!Array.isArray(tagsToRemove)) {
    tagsToRemove = [tagsToRemove];
  }
  
  this.tags = this.tags.filter(tag => 
    !tagsToRemove.map(t => t.toLowerCase()).includes(tag)
  );
  
  return this.save();
};

// Pre-save middleware for validation and cleanup
bookmarkSchema.pre('save', function(next) {
  // Clean up tags
  if (this.tags && this.tags.length > 0) {
    this.tags = this.tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  }
  
  // Set default metadata if not provided
  if (!this.metadata.source) {
    this.metadata.source = 'web';
  }
  
  next();
});

export default mongoose.model("Bookmark", bookmarkSchema);
