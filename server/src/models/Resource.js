import { Schema, model } from "mongoose";
import slug from "slugify";

const resourceSchema = new Schema({
  title: {
    type: String,
    required: [true, "Resource title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Resource description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  category: {
    type: String,
    enum: ["books", "articles", "videos", "audio", "documents", "links", "apps", "courses"],
    required: [true, "Category is required"]
  },
  subcategory: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["file", "link", "embedded"],
    required: [true, "Resource type is required"]
  },
  content: {
    fileUrl: {
      type: String
    },
    externalUrl: {
      type: String
    },
    embedCode: {
      type: String
    },
    fileName: {
      type: String
    },
    fileSize: {
      type: Number // in bytes
    },
    mimeType: {
      type: String
    }
  },
  author: {
    name: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    credentials: [{
      type: String,
      trim: true
    }],
    image: {
      type: String
    }
  },
  publisher: {
    name: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    publishedDate: {
      type: Date
    }
  },
  metadata: {
    language: {
      type: String,
      default: "english",
      enum: ["english", "arabic", "hausa", "yoruba", "igbo", "french"]
    },
    duration: {
      type: Number // in minutes for audio/video
    },
    pages: {
      type: Number // for books/documents
    },
    isbn: {
      type: String,
      trim: true
    },
    edition: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all"
    }
  },
  topics: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  thumbnail: {
    type: String
  },
  preview: {
    images: [{
      type: String
    }],
    excerpt: {
      type: String,
      maxlength: [500, "Excerpt cannot exceed 500 characters"]
    },
    tableOfContents: [{
      chapter: String,
      page: Number
    }]
  },
  access: {
    level: {
      type: String,
      enum: ["public", "members", "premium", "restricted"],
      default: "public"
    },
    requiresLogin: {
      type: Boolean,
      default: false
    },
    downloadable: {
      type: Boolean,
      default: true
    },
    printable: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived", "under_review"],
    default: "draft",
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate slug
resourceSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Validate content based on type
resourceSchema.pre('save', function(next) {
  if (this.type === 'file' && !this.content.fileUrl) {
    return next(new Error('File URL is required for file type resources'));
  }
  if (this.type === 'link' && !this.content.externalUrl) {
    return next(new Error('External URL is required for link type resources'));
  }
  if (this.type === 'embedded' && !this.content.embedCode) {
    return next(new Error('Embed code is required for embedded type resources'));
  }
  next();
});

// Index for better query performance
resourceSchema.index({ status: 1, category: 1 });
resourceSchema.index({ featured: 1, status: 1 });
resourceSchema.index({ topics: 1, status: 1 });
resourceSchema.index({ tags: 1, status: 1 });
resourceSchema.index({ slug: 1 });
resourceSchema.index({ 'metadata.language': 1, status: 1 });
resourceSchema.index({ 'metadata.difficulty': 1, status: 1 });
resourceSchema.index({ 'statistics.views': -1 });
resourceSchema.index({ 'ratings.average': -1 });

// Text index for search functionality
resourceSchema.index({
  title: 'text',
  description: 'text',
  topics: 'text',
  tags: 'text',
  'author.name': 'text'
});

// Virtual for checking if resource is downloadable
resourceSchema.virtual('isDownloadable').get(function() {
  return this.access.downloadable && this.type === 'file' && this.content.fileUrl;
});

// Virtual for file size in human readable format
resourceSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.content.fileSize) return null;
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.content.fileSize) / Math.log(1024));
  return Math.round(this.content.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for popularity score (combination of views, downloads, ratings)
resourceSchema.virtual('popularityScore').get(function() {
  const viewsWeight = 0.3;
  const downloadsWeight = 0.4;
  const ratingsWeight = 0.3;
  
  return (
    (this.statistics.views * viewsWeight) +
    (this.statistics.downloads * downloadsWeight) +
    (this.ratings.average * this.ratings.count * ratingsWeight)
  );
});

const Resource = model("Resource", resourceSchema, "resources");
export default Resource;
