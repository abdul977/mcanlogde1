import express from "express";
import {
  createBooking,
  getBookings,
  searchBookings,
  updateAvailability,
} from "../controller/Booking.js";
const router = express.Router();

router.get("/search/:keyword", searchBookings);
router.patch("/update-availability", updateAvailability);
router.post("/create-booking", createBooking);
router.get("/get-all-bookings", getBookings);

export default router;
