import express from "express";
import {
  createBookingController,
  getUserBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
  getBookingController,
  cancelBookingController,
  syncAccommodationAvailability,
  getOverduePayments
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

// Get overdue payments (admin only)
router.get("/admin/overdue-payments", requireSignIn, isAdmin, getOverduePayments);

// Sync accommodation availability (admin only)
router.post("/admin/sync-availability", requireSignIn, isAdmin, async (req, res) => {
  try {
    const result = await syncAccommodationAvailability();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error syncing accommodation availability",
      error: error.message
    });
  }
});

export default router;
