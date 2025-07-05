import express from "express";
import {
  createCommunityController,
  getCommunityItemController,
  getAllCommunityController,
  getAllCommunityAdminController,
  getCommunityItemByIdController,
  updateCommunityController,
  deleteCommunityController,
  getFeaturedCommunityController,
  getTestimonialsController
} from "../controller/Community.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published community items with filtering and search
router.get("/get-all-community", getAllCommunityController);

// Get featured community items
router.get("/featured", getFeaturedCommunityController);

// Get testimonials
router.get("/testimonials", getTestimonialsController);

// Get single community item by slug
router.get("/get-community/:slug", getCommunityItemController);

// Admin routes (protected)
// Get all community items for admin (includes all statuses)
router.get("/admin/get-all-community", requireSignIn, isAdmin, getAllCommunityAdminController);

// Get single community item by ID (admin)
router.get("/admin/get-community-by-id/:id", requireSignIn, isAdmin, getCommunityItemByIdController);

// Create community item (admin only)
router.post("/admin/create-community", requireSignIn, isAdmin, createCommunityController);

// Update community item (admin only)
router.put("/admin/update-community/:id", requireSignIn, isAdmin, updateCommunityController);

// Delete community item (admin only)
router.delete("/admin/delete-community/:id", requireSignIn, isAdmin, deleteCommunityController);

export default router;
