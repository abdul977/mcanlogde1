import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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
    // Optional: Track what type of content is being liked
    // This allows for future expansion to like comments, etc.
    contentType: {
      type: String,
      enum: ["blog", "comment"],
      default: "blog"
    },
    // For future expansion - reference to comment if liking a comment
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
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
likeSchema.index({ user: 1, blog: 1 }, { unique: true }); // Prevent duplicate likes
likeSchema.index({ blog: 1, createdAt: -1 }); // For fetching blog likes
likeSchema.index({ user: 1, createdAt: -1 }); // For user's liked content
likeSchema.index({ contentType: 1, createdAt: -1 }); // For analytics

// Virtual for formatted creation date
likeSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to toggle like for a blog
likeSchema.statics.toggleBlogLike = async function(userId, blogId, metadata = {}) {
  try {
    // Check if like already exists
    const existingLike = await this.findOne({ user: userId, blog: blogId });
    
    if (existingLike) {
      // Remove like
      await this.deleteOne({ _id: existingLike._id });
      return {
        liked: false,
        message: "Blog unliked successfully"
      };
    } else {
      // Add like
      const newLike = new this({
        user: userId,
        blog: blogId,
        contentType: "blog",
        metadata
      });
      await newLike.save();
      return {
        liked: true,
        message: "Blog liked successfully"
      };
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - like already exists
      throw new Error("You have already liked this blog");
    }
    throw error;
  }
};

// Static method to check if user liked a blog
likeSchema.statics.isLikedByUser = async function(userId, blogId) {
  const like = await this.findOne({ user: userId, blog: blogId });
  return !!like;
};

// Static method to get likes count for a blog
likeSchema.statics.getLikesCount = async function(blogId) {
  return await this.countDocuments({ blog: blogId });
};

// Static method to get likes for a blog with user details
likeSchema.statics.getBlogLikes = async function(blogId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  
  return await this.find({ blog: blogId })
    .populate('user', 'name email')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Static method to get user's liked blogs
likeSchema.statics.getUserLikedBlogs = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  
  return await this.find({ user: userId, contentType: "blog" })
    .populate({
      path: 'blog',
      select: 'title slug excerpt featuredImage category publishDate readTime status',
      match: { status: 'published' } // Only return published blogs
    })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Static method for analytics - get likes by date range
likeSchema.statics.getLikesAnalytics = async function(blogId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        blog: mongoose.Types.ObjectId(blogId),
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get top liked blogs
likeSchema.statics.getTopLikedBlogs = async function(options = {}) {
  const {
    limit = 10,
    timeframe = null, // 'week', 'month', 'year', or null for all time
    category = null
  } = options;
  
  let matchStage = {};
  
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
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$blog",
        likesCount: { $sum: 1 },
        latestLike: { $max: "$createdAt" }
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
        "blog.status": "published",
        ...(category && { "blog.category": category })
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
        readTime: "$blog.readTime",
        likesCount: 1,
        latestLike: 1
      }
    },
    { $sort: { likesCount: -1, latestLike: -1 } },
    { $limit: limit }
  ];
  
  return await this.aggregate(pipeline);
};

// Pre-save middleware for metadata
likeSchema.pre('save', function(next) {
  // Set default metadata if not provided
  if (!this.metadata.source) {
    this.metadata.source = 'web';
  }
  next();
});

export default mongoose.model("Like", likeSchema);
