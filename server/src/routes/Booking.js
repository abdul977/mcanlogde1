import express from "express";
import {
  createBookingController,
  getUserBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
  getBookingController,
  cancelBookingController,
  syncAccommodationAvailability,
  getOverduePayments,
  getAccommodationBookingStats,
  getBookingOverview
} from "../controller/Booking.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";
import { requirePermission, requireAnyPermission } from "../middlewares/PermissionAuth.js";
import { requireResourceAccess, requireStateScope } from "../middlewares/ResourceOwnership.js";
import { generalRateLimit } from "../middlewares/RateLimit.js";

const router = express.Router();

// User routes (protected) with RBAC
// Create a new booking request
router.post("/create",
  requireSignIn,
  generalRateLimit,
  requirePermission('bookings', 'create'),
  createBookingController
);

// Get user's own bookings
router.get("/my-bookings",
  requireSignIn,
  requirePermission('bookings', 'read'),
  getUserBookingsController
);

// Get single booking details
router.get("/:id",
  requireSignIn,
  requireResourceAccess('bookings', { action: 'read' }),
  getBookingController
);

// Cancel user's own booking
router.put("/:id/cancel",
  requireSignIn,
  requireResourceAccess('bookings', { action: 'update' }),
  cancelBookingController
);

// Admin routes (protected) with RBAC
// Get all bookings (admin only)
router.get("/admin/all",
  requireSignIn,
  requireAnyPermission([
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'manage' }
  ]),
  requireStateScope,
  getAllBookingsController
);

// Update booking status (admin only)
router.put("/admin/:id/status",
  requireSignIn,
  requirePermission('bookings', 'approve'),
  requireResourceAccess('bookings', { action: 'approve' }),
  updateBookingStatusController
);

// Get overdue payments (admin only)
router.get("/admin/overdue-payments",
  requireSignIn,
  requireAnyPermission([
    { resource: 'payments', action: 'read' },
    { resource: 'bookings', action: 'manage' }
  ]),
  requireStateScope,
  getOverduePayments
);

// Sync accommodation availability (admin only)
router.post("/admin/sync-availability",
  requireSignIn,
  requirePermission('bookings', 'manage'),
  async (req, res) => {
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
  }
);

// Get booking statistics for a specific accommodation
router.get("/stats/:accommodationId",
  requireSignIn,
  requirePermission('reports', 'read'),
  getAccommodationBookingStats
);

// Get booking overview for all accommodations (admin only)
router.get("/admin/overview",
  requireSignIn,
  requirePermission('reports', 'read'),
  requireStateScope,
  getBookingOverview
);

export default router;
