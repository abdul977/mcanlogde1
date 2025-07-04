import { Schema, model } from "mongoose";
import slug from "slugify";

const eventSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  image: {
    type: String,
    required: [true, "Event image is required"],
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    required: true,
  },
  slug: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug from title if not provided
  if (this.title && !this.slug) {
    this.slug = slug(this.title, { lower: true });
  }
  
  next();
});

const Event = model("Event", eventSchema, "events");
export default Event;