import express from "express";
import {
  createDonationController,
  getDonationController,
  getAllDonationsController,
  getAllDonationsAdminController,
  getDonationByIdController,
  updateDonationController,
  deleteDonationController,
  getFeaturedDonationsController,
  getUrgentDonationsController,
  addSponsorController
} from "../controller/Donation.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all active donations with filtering and search
router.get("/get-all-donations", getAllDonationsController);

// Get featured donations
router.get("/featured", getFeaturedDonationsController);

// Get urgent donations
router.get("/urgent", getUrgentDonationsController);

// Get single donation by slug
router.get("/get-donation/:slug", getDonationController);

// Add sponsor to donation (public)
router.post("/sponsor/:id", addSponsorController);

// Admin routes (protected)
// Get all donations for admin (includes all statuses)
router.get("/admin/get-all-donations", requireSignIn, isAdmin, getAllDonationsAdminController);

// Get single donation by ID (admin)
router.get("/admin/get-donation-by-id/:id", requireSignIn, isAdmin, getDonationByIdController);

// Create donation (admin only)
router.post("/admin/create-donation", requireSignIn, isAdmin, createDonationController);

// Update donation (admin only)
router.put("/admin/update-donation/:id", requireSignIn, isAdmin, updateDonationController);

// Delete donation (admin only)
router.delete("/admin/delete-donation/:id", requireSignIn, isAdmin, deleteDonationController);

export default router;
