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
  updateAccommodationStatusController
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

export default router;
