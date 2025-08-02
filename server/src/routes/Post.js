import express from "express";
import {
  createPostController,
  getPostController,
  getAllPostController,
  updatePostController,
  deletePostController,
  nearMosqueController,
  getAccommodationsByGender,
  getRelatedPostController,
  searchAccommodationsController,
  updateAccommodationStatusController,
  updateBookingLimitsController,
  getAdminBookingOverview,
  bulkUpdateBookingLimitsController
} from "../controller/Post.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Get available rooms by gender
router.get("/accommodations/:gender", getAccommodationsByGender);

// Create accommodation listing (admin only)
router.post("/create-post", requireSignIn, isAdmin, createPostController);

// Get all accommodations
router.get("/get-all-post", getAllPostController);

// Get single accommodation
router.get("/get-post/:slug", getPostController);

// Update accommodation (admin only)
router.put("/update-post/:id", requireSignIn, isAdmin, updatePostController);

// Delete accommodation (admin only)
router.delete("/delete-post/:pid", requireSignIn, isAdmin, deletePostController);

// Update accommodation status (admin only)
router.put("/admin/status/:id", requireSignIn, isAdmin, updateAccommodationStatusController);

// Get accommodations near mosques
router.get("/near-mosque", nearMosqueController);

// Search accommodations
router.get("/search/:keyword", searchAccommodationsController);

// Get related posts
router.get("/related/:pid/:cid", getRelatedPostController);

// Admin booking limit management routes
// Update booking limits for a specific accommodation (admin only)
router.put("/admin/booking-limits/:postId", requireSignIn, isAdmin, updateBookingLimitsController);

// Get booking overview for all accommodations (admin only)
router.get("/admin/booking-overview", requireSignIn, isAdmin, getAdminBookingOverview);

// Bulk update booking limits (admin only)
router.put("/admin/booking-limits/bulk", requireSignIn, isAdmin, bulkUpdateBookingLimitsController);

export default router;
