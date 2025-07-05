import express from "express";
import {
  getAllBlogsController,
  getAllBlogsAdminController,
  getBlogController,
  getFeaturedBlogsController,
  createBlogController,
  updateBlogController,
  deleteBlogController
} from "../controller/Blog.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published blogs
router.get("/get-all-blogs", getAllBlogsController);

// Get featured blogs
router.get("/featured-blogs", getFeaturedBlogsController);

// Get single blog by slug
router.get("/get-blog/:slug", getBlogController);

// Admin routes (protected)
// Get all blogs for admin (includes drafts)
router.get("/admin/get-all-blogs", requireSignIn, isAdmin, getAllBlogsAdminController);

// Create blog
router.post("/create-blog", requireSignIn, isAdmin, createBlogController);

// Update blog
router.put("/update-blog/:id", requireSignIn, isAdmin, updateBlogController);

// Delete blog
router.delete("/delete-blog/:id", requireSignIn, isAdmin, deleteBlogController);

export default router;
