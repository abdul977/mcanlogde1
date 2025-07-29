import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
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
    // Share platform/method
    platform: {
      type: String,
      enum: [
        "facebook",
        "twitter",
        "linkedin",
        "whatsapp",
        "telegram",
        "email",
        "copy_link",
        "native_share",
        "other"
      ],
      required: [true, "Share platform is required"]
    },
    // Share method details
    shareMethod: {
      type: String,
      enum: ["direct", "copy_link", "native_api", "web_share_api"],
      default: "direct"
    },
    // Analytics metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      platform: String,
      source: {
        type: String,
        enum: ["web", "mobile", "api"],
        default: "web"
      },
      // Track where the share was initiated from
      referrer: String,
      // Device information
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
        default: "desktop"
      },
      // Browser/app information
      browser: String,
      operatingSystem: String
    },
    // Share context
    shareContext: {
      // Where in the app the share was initiated
      location: {
        type: String,
        enum: ["blog_detail", "blog_list", "home_carousel", "search_results", "bookmarks"],
        default: "blog_detail"
      },
      // Additional context data
      additionalData: mongoose.Schema.Types.Mixed
    },
    // Success tracking
    shareSuccess: {
      type: Boolean,
      default: true
    },
    // Error information if share failed
    errorInfo: {
      errorCode: String,
      errorMessage: String,
      errorDetails: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance and analytics
shareSchema.index({ blog: 1, createdAt: -1 }); // For blog share analytics
shareSchema.index({ user: 1, createdAt: -1 }); // For user share history
shareSchema.index({ platform: 1, createdAt: -1 }); // For platform analytics
shareSchema.index({ "metadata.source": 1, createdAt: -1 }); // For source analytics
shareSchema.index({ "shareContext.location": 1, createdAt: -1 }); // For location analytics
shareSchema.index({ shareSuccess: 1, createdAt: -1 }); // For success rate analytics

// Virtual for formatted creation date
shareSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to record a share
shareSchema.statics.recordShare = async function(shareData) {
  const {
    userId,
    blogId,
    platform,
    shareMethod = "direct",
    metadata = {},
    shareContext = {},
    shareSuccess = true,
    errorInfo = null
  } = shareData;
  
  try {
    const share = new this({
      user: userId,
      blog: blogId,
      platform,
      shareMethod,
      metadata,
      shareContext,
      shareSuccess,
      errorInfo
    });
    
    await share.save();
    return {
      success: true,
      message: "Share recorded successfully",
      shareId: share._id
    };
  } catch (error) {
    console.error("Error recording share:", error);
    throw error;
  }
};

// Static method to get share count for a blog
shareSchema.statics.getShareCount = async function(blogId) {
  return await this.countDocuments({ 
    blog: blogId, 
    shareSuccess: true 
  });
};

// Static method to get share analytics for a blog
shareSchema.statics.getBlogShareAnalytics = async function(blogId, options = {}) {
  const {
    startDate = null,
    endDate = null,
    groupBy = "platform" // "platform", "source", "location", "day"
  } = options;
  
  let matchStage = { 
    blog: mongoose.Types.ObjectId(blogId),
    shareSuccess: true
  };
  
  // Add date filter if provided
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  let groupStage = {};
  
  switch (groupBy) {
    case "platform":
      groupStage = {
        _id: "$platform",
        count: { $sum: 1 },
        lastShared: { $max: "$createdAt" }
      };
      break;
    case "source":
      groupStage = {
        _id: "$metadata.source",
        count: { $sum: 1 },
        lastShared: { $max: "$createdAt" }
      };
      break;
    case "location":
      groupStage = {
        _id: "$shareContext.location",
        count: { $sum: 1 },
        lastShared: { $max: "$createdAt" }
      };
      break;
    case "day":
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        count: { $sum: 1 }
      };
      break;
  }
  
  const pipeline = [
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { count: -1 } }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get top shared blogs
shareSchema.statics.getTopSharedBlogs = async function(options = {}) {
  const {
    limit = 10,
    timeframe = null, // 'week', 'month', 'year', or null for all time
    platform = null
  } = options;
  
  let matchStage = { shareSuccess: true };
  
  // Add time filter if specified
  if (timeframe) {
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
    }
    
    if (startDate) {
      matchStage.createdAt = { $gte: startDate };
    }
  }
  
  // Add platform filter if specified
  if (platform) {
    matchStage.platform = platform;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$blog",
        shareCount: { $sum: 1 },
        platforms: { $addToSet: "$platform" },
        latestShare: { $max: "$createdAt" }
      }
    },
    {
      $lookup: {
        from: "blogs",
        localField: "_id",
        foreignField: "_id",
        as: "blog"
      }
    },
    { $unwind: "$blog" },
    {
      $match: {
        "blog.status": "published"
      }
    },
    {
      $project: {
        _id: "$blog._id",
        title: "$blog.title",
        slug: "$blog.slug",
        excerpt: "$blog.excerpt",
        featuredImage: "$blog.featuredImage",
        category: "$blog.category",
        publishDate: "$blog.publishDate",
        shareCount: 1,
        platforms: 1,
        latestShare: 1
      }
    },
    { $sort: { shareCount: -1, latestShare: -1 } },
    { $limit: limit }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get user's share history
shareSchema.statics.getUserShareHistory = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    platform = null,
    successOnly = true
  } = options;
  
  const skip = (page - 1) * limit;
  
  let query = { user: userId };
  if (platform) query.platform = platform;
  if (successOnly) query.shareSuccess = true;
  
  return await this.find(query)
    .populate('blog', 'title slug excerpt featuredImage category publishDate')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get platform usage statistics
shareSchema.statics.getPlatformStats = async function(options = {}) {
  const {
    startDate = null,
    endDate = null,
    source = null
  } = options;
  
  let matchStage = { shareSuccess: true };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  if (source) {
    matchStage["metadata.source"] = source;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$platform",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$user" },
        uniqueBlogs: { $addToSet: "$blog" }
      }
    },
    {
      $project: {
        platform: "$_id",
        shareCount: "$count",
        uniqueUsersCount: { $size: "$uniqueUsers" },
        uniqueBlogsCount: { $size: "$uniqueBlogs" }
      }
    },
    { $sort: { shareCount: -1 } }
  ];
  
  return await this.aggregate(pipeline);
};

// Pre-save middleware for data validation and enrichment
shareSchema.pre('save', function(next) {
  // Set default metadata if not provided
  if (!this.metadata.source) {
    this.metadata.source = 'web';
  }
  
  // Set default share context location
  if (!this.shareContext.location) {
    this.shareContext.location = 'blog_detail';
  }
  
  next();
});

export default mongoose.model("Share", shareSchema);
