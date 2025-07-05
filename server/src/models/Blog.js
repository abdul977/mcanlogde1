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

export default mongoose.model("Blog", blogSchema);
