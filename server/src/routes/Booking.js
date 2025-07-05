import express from "express";
import {
  createBookingController,
  getUserBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
  getBookingController,
  cancelBookingController
} from "../controller/Booking.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// User routes (protected)
// Create a new booking request
router.post("/create", requireSignIn, createBookingController);

// Get user's own bookings
router.get("/my-bookings", requireSignIn, getUserBookingsController);

// Get single booking details
router.get("/:id", requireSignIn, getBookingController);

// Cancel user's own booking
router.put("/:id/cancel", requireSignIn, cancelBookingController);

// Admin routes (protected)
// Get all bookings (admin only)
router.get("/admin/all", requireSignIn, isAdmin, getAllBookingsController);

// Update booking status (admin only)
router.put("/admin/:id/status", requireSignIn, isAdmin, updateBookingStatusController);

export default router;
