import express from "express";
import {
  createLectureController,
  getLectureController,
  getAllLecturesController,
  getAllLecturesAdminController,
  getLectureByIdController,
  updateLectureController,
  deleteLectureController,
  getUpcomingLecturesController
} from "../controller/Lecture.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published lectures
router.get("/get-all-lectures", getAllLecturesController);

// Get upcoming lectures
router.get("/upcoming", getUpcomingLecturesController);

// Get single lecture by slug
router.get("/get-lecture/:slug", getLectureController);

// Admin routes (protected)
// Get all lectures for admin (includes all statuses)
router.get("/admin/get-all-lectures", requireSignIn, isAdmin, getAllLecturesAdminController);

// Get single lecture by ID (admin)
router.get("/admin/get-lecture-by-id/:id", requireSignIn, isAdmin, getLectureByIdController);

// Create lecture (admin only)
router.post("/admin/create-lecture", requireSignIn, isAdmin, createLectureController);

// Update lecture (admin only)
router.put("/admin/update-lecture/:id", requireSignIn, isAdmin, updateLectureController);

// Delete lecture (admin only)
router.delete("/admin/delete-lecture/:id", requireSignIn, isAdmin, deleteLectureController);

export default router;
