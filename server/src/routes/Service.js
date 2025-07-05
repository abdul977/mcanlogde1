import express from "express";
import {
  createServiceController,
  getServiceController,
  getAllServicesController,
  getAllServicesAdminController,
  getServiceByIdController,
  updateServiceController,
  deleteServiceController,
  getServicesByCategoryController
} from "../controller/Service.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all active services
router.get("/get-all-services", getAllServicesController);

// Get services by category
router.get("/category/:category", getServicesByCategoryController);

// Get single service by slug
router.get("/get-service/:slug", getServiceController);

// Admin routes (protected)
// Get all services for admin (includes all statuses)
router.get("/admin/get-all-services", requireSignIn, isAdmin, getAllServicesAdminController);

// Get single service by ID (admin)
router.get("/admin/get-service-by-id/:id", requireSignIn, isAdmin, getServiceByIdController);

// Create service (admin only)
router.post("/admin/create-service", requireSignIn, isAdmin, createServiceController);

// Update service (admin only)
router.put("/admin/update-service/:id", requireSignIn, isAdmin, updateServiceController);

// Delete service (admin only)
router.delete("/admin/delete-service/:id", requireSignIn, isAdmin, deleteServiceController);

export default router;
