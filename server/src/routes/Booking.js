import express from "express";
import {
  createBooking,
  getBookings,
  searchBookings,
  updateAvailability,
  createPaymentIntent,
} from "../controller/Booking.js";
const router = express.Router();

router.get("/search/:keyword", searchBookings);
router.patch("/update-availability", updateAvailability);
router.post("/create-booking", createBooking);
router.get("/get-all-bookings", getBookings);
router.post("/create-payment-intent", createPaymentIntent);

export default router;
