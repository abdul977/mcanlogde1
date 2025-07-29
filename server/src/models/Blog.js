import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
      minlength: [100, "Content must be at least 100 characters"]
    },
    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      maxlength: [300, "Excerpt cannot exceed 300 characters"]
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      default: "MCAN Admin"
    },
    featuredImage: {
      type: String,
      required: [true, "Featured image is required"]
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft"
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    category: {
      type: String,
      enum: ["general", "islamic", "education", "community", "events", "announcements"],
      default: "general"
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    views: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"]
    },
    readTime: {
      type: Number, // in minutes
      default: 5
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishDate: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ featured: 1, publishDate: -1 });

// Virtual for formatted publish date
blogSchema.virtual('formattedPublishDate').get(function() {
  return this.publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for likes count
blogSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Virtual for comments count
blogSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true,
  match: { status: 'approved' }
});

// Virtual for shares count
blogSchema.virtual('sharesCount', {
  ref: 'Share',
  localField: '_id',
  foreignField: 'blog',
  count: true,
  match: { shareSuccess: true }
});

// Virtual for bookmarks count
blogSchema.virtual('bookmarksCount', {
  ref: 'Bookmark',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Calculate read time based on content length
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Static method to get published blogs
blogSchema.statics.getPublished = function() {
  return this.find({ status: 'published' })
    .sort({ publishDate: -1 });
};

// Static method to get featured blogs
blogSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ status: 'published', featured: true })
    .sort({ publishDate: -1 })
    .limit(limit);
};

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get blogs with interaction counts
blogSchema.statics.getBlogsWithInteractions = async function(query = {}, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'publishDate',
    sortOrder = -1,
    includeInteractions = true
  } = options;

  const skip = (page - 1) * limit;

  let aggregationPipeline = [
    { $match: query },
    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: limit }
  ];

  if (includeInteractions) {
    // Add interaction counts using lookup and count
    aggregationPipeline.push(
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'blog',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'blog',
          pipeline: [{ $match: { status: 'approved' } }],
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'shares',
          localField: '_id',
          foreignField: 'blog',
          pipeline: [{ $match: { shareSuccess: true } }],
          as: 'shares'
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'blog',
          as: 'bookmarks'
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          sharesCount: { $size: '$shares' },
          bookmarksCount: { $size: '$bookmarks' }
        }
      },
      {
        $project: {
          likes: 0,
          comments: 0,
          shares: 0,
          bookmarks: 0
        }
      }
    );
  }

  return await this.aggregate(aggregationPipeline);
};

// Static method to get blog with user-specific interaction status
blogSchema.statics.getBlogWithUserInteractions = async function(blogId, userId = null) {
  const pipeline = [
    { $match: { _id: mongoose.Types.ObjectId(blogId) } },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'blog',
        as: 'allLikes'
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'blog',
        pipeline: [{ $match: { status: 'approved' } }],
        as: 'allComments'
      }
    },
    {
      $lookup: {
        from: 'shares',
        localField: '_id',
        foreignField: 'blog',
        pipeline: [{ $match: { shareSuccess: true } }],
        as: 'allShares'
      }
    },
    {
      $lookup: {
        from: 'bookmarks',
        localField: '_id',
        foreignField: 'blog',
        as: 'allBookmarks'
      }
    },
    {
      $addFields: {
        likesCount: { $size: '$allLikes' },
        commentsCount: { $size: '$allComments' },
        sharesCount: { $size: '$allShares' },
        bookmarksCount: { $size: '$allBookmarks' }
      }
    }
  ];

  if (userId) {
    pipeline.push({
      $addFields: {
        isLikedByUser: {
          $in: [mongoose.Types.ObjectId(userId), '$allLikes.user']
        },
        isBookmarkedByUser: {
          $in: [mongoose.Types.ObjectId(userId), '$allBookmarks.user']
        }
      }
    });
  }

  pipeline.push({
    $project: {
      allLikes: 0,
      allComments: 0,
      allShares: 0,
      allBookmarks: 0
    }
  });

  const result = await this.aggregate(pipeline);
  return result[0] || null;
};

export default mongoose.model("Blog", blogSchema);
