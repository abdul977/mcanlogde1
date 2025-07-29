import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog reference is required"],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"]
    },
    // For nested replies
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true
    },
    // Comment status for moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "approved" // Auto-approve for now, can be changed to "pending" for moderation
    },
    // Moderation fields
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    moderatedAt: {
      type: Date
    },
    moderationReason: {
      type: String,
      trim: true
    },
    // Interaction tracking
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Reporting system
    reports: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: {
        type: String,
        enum: ["spam", "inappropriate", "harassment", "misinformation", "other"],
        required: true
      },
      description: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance optimization
commentSchema.index({ blog: 1, createdAt: -1 }); // For fetching blog comments
commentSchema.index({ user: 1, createdAt: -1 }); // For user's comments
commentSchema.index({ parentComment: 1, createdAt: 1 }); // For nested replies
commentSchema.index({ status: 1, createdAt: -1 }); // For moderation
commentSchema.index({ "reports.0": 1 }); // For finding reported comments

// Virtual for likes count
commentSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Virtual for formatted creation date
commentSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Instance method to check if user liked the comment
commentSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Instance method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (existingLikeIndex > -1) {
    // Remove like
    this.likes.splice(existingLikeIndex, 1);
    return { liked: false, likesCount: this.likes.length };
  } else {
    // Add like
    this.likes.push({ user: userId });
    return { liked: true, likesCount: this.likes.length };
  }
};

// Instance method to add report
commentSchema.methods.addReport = function(userId, reason, description) {
  // Check if user already reported this comment
  const existingReport = this.reports.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('You have already reported this comment');
  }
  
  this.reports.push({
    user: userId,
    reason,
    description
  });
  
  // Auto-hide comment if it receives multiple reports
  if (this.reports.length >= 3) {
    this.status = 'hidden';
  }
  
  return this.save();
};

// Instance method to edit comment
commentSchema.methods.editContent = function(newContent) {
  // Save current content to edit history
  if (this.content !== newContent) {
    this.editHistory.push({
      content: this.content
    });
    this.content = newContent;
    this.isEdited = true;
  }
  return this.save();
};

// Static method to get comments for a blog with pagination
commentSchema.statics.getCommentsForBlog = function(blogId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    includeReplies = true,
    status = 'approved'
  } = options;
  
  const skip = (page - 1) * limit;
  
  let query = {
    blog: blogId,
    status: status
  };
  
  // Only get top-level comments if not including replies
  if (!includeReplies) {
    query.parentComment = null;
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('parentComment')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Static method to get comment thread (comment + all its replies)
commentSchema.statics.getCommentThread = function(commentId) {
  return this.findById(commentId)
    .populate('user', 'name email')
    .populate({
      path: 'parentComment',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Pre-save middleware for validation
commentSchema.pre('save', function(next) {
  // Validate that parent comment exists and belongs to same blog
  if (this.parentComment && this.isModified('parentComment')) {
    this.constructor.findById(this.parentComment)
      .then(parentComment => {
        if (!parentComment) {
          return next(new Error('Parent comment not found'));
        }
        if (parentComment.blog.toString() !== this.blog.toString()) {
          return next(new Error('Parent comment must belong to the same blog'));
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Pre-remove middleware to handle cascading deletes
commentSchema.pre('remove', async function(next) {
  try {
    // Delete all replies to this comment
    await this.constructor.deleteMany({ parentComment: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Comment", commentSchema);
