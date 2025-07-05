import express from "express";
import {
  createQuranClassController,
  getQuranClassController,
  getAllQuranClassesController,
  getAllQuranClassesAdminController,
  getQuranClassByIdController,
  updateQuranClassController,
  deleteQuranClassController,
  getAvailableClassesController
} from "../controller/QuranClass.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published Quran classes
router.get("/get-all-classes", getAllQuranClassesController);

// Get available classes for enrollment
router.get("/available", getAvailableClassesController);

// Get single Quran class by slug
router.get("/get-class/:slug", getQuranClassController);

// Admin routes (protected)
// Get all Quran classes for admin (includes all statuses)
router.get("/admin/get-all-classes", requireSignIn, isAdmin, getAllQuranClassesAdminController);

// Get single Quran class by ID (admin)
router.get("/admin/get-class-by-id/:id", requireSignIn, isAdmin, getQuranClassByIdController);

// Create Quran class (admin only)
router.post("/admin/create-class", requireSignIn, isAdmin, createQuranClassController);

// Update Quran class (admin only)
router.put("/admin/update-class/:id", requireSignIn, isAdmin, updateQuranClassController);

// Delete Quran class (admin only)
router.delete("/admin/delete-class/:id", requireSignIn, isAdmin, deleteQuranClassController);

export default router;
