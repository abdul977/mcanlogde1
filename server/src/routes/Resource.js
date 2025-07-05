import express from "express";
import {
  createResourceController,
  getResourceController,
  getAllResourcesController,
  getAllResourcesAdminController,
  getResourceByIdController,
  updateResourceController,
  deleteResourceController,
  getFeaturedResourcesController,
  getPopularResourcesController,
  incrementDownloadController
} from "../controller/Resource.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published resources with filtering and search
router.get("/get-all-resources", getAllResourcesController);

// Get featured resources
router.get("/featured", getFeaturedResourcesController);

// Get popular resources
router.get("/popular", getPopularResourcesController);

// Get single resource by slug
router.get("/get-resource/:slug", getResourceController);

// Increment download count
router.post("/download/:id", incrementDownloadController);

// Admin routes (protected)
// Get all resources for admin (includes all statuses)
router.get("/admin/get-all-resources", requireSignIn, isAdmin, getAllResourcesAdminController);

// Get single resource by ID (admin)
router.get("/admin/get-resource-by-id/:id", requireSignIn, isAdmin, getResourceByIdController);

// Create resource (admin only)
router.post("/admin/create-resource", requireSignIn, isAdmin, createResourceController);

// Update resource (admin only)
router.put("/admin/update-resource/:id", requireSignIn, isAdmin, updateResourceController);

// Delete resource (admin only)
router.delete("/admin/delete-resource/:id", requireSignIn, isAdmin, deleteResourceController);

export default router;
