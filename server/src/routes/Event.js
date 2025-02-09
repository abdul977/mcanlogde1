import express from "express";
import {
  createEventController,
  getEventController,
  getAllEventsController,
  updateEventController,
  deleteEventController,
  getUpcomingEventsController,
  getEventByIdController  // Add the new controller
} from "../controller/Event.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Get all events (public)
router.get("/get-all-events", getAllEventsController);

// Get upcoming events (public)
router.get("/upcoming-events", getUpcomingEventsController);

// Get single event by slug (public)
router.get("/get-event/:slug", getEventController);

// Get single event by ID (public)
router.get("/get-event-by-id/:id", getEventByIdController);

// Create event (admin only)
router.post("/create-event", requireSignIn, isAdmin, createEventController);

// Update event (admin only)
router.put("/update-event/:id", requireSignIn, isAdmin, updateEventController);

// Delete event (admin only)
router.delete("/delete-event/:id", requireSignIn, isAdmin, deleteEventController);

export default router;