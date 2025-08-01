import express from "express";
import {
  createCommunityController,
  getAllCommunitiesController,
  getCommunityController,
  getCommunityByIdController,
  getUserCommunitiesController,
  updateCommunityController,
  deleteCommunityController,
  getAllCommunitiesAdminController,
  approveCommunityController,
  rejectCommunityController,
  suspendCommunityController,
  getModerationLogsController,
  updateCommunitySettingsController
} from "../controller/ChatCommunity.js";
import { requireAuth, requireAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Middleware to validate file uploads (works with express-fileupload)
const validateCommunityFiles = (req, res, next) => {
  try {
    // Check if files exist and validate them
    if (req.files) {
      const { avatar, banner } = req.files;

      // Validate avatar if present
      if (avatar) {
        if (!avatar.mimetype.startsWith('image/')) {
          return res.status(400).json({
            success: false,
            message: 'Avatar must be an image file'
          });
        }
        if (avatar.size > 5 * 1024 * 1024) { // 5MB limit
          return res.status(400).json({
            success: false,
            message: 'Avatar file size must be less than 5MB'
          });
        }
      }

      // Validate banner if present
      if (banner) {
        if (!banner.mimetype.startsWith('image/')) {
          return res.status(400).json({
            success: false,
            message: 'Banner must be an image file'
          });
        }
        if (banner.size > 5 * 1024 * 1024) { // 5MB limit
          return res.status(400).json({
            success: false,
            message: 'Banner file size must be less than 5MB'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(400).json({
      success: false,
      message: 'Error validating uploaded files'
    });
  }
};

// Public routes
router.get("/", getAllCommunitiesController);
router.get("/by-id/:id", requireAuth, getCommunityByIdController); // Requires auth to get user context
router.get("/:slug", getCommunityController);

// Protected routes (require authentication)
router.post("/create",
  requireAuth,
  validateCommunityFiles,
  createCommunityController
);

router.get("/user/my-communities", requireAuth, getUserCommunitiesController);

router.put("/:id",
  requireAuth,
  validateCommunityFiles,
  updateCommunityController
);

// Community moderation and settings routes
router.get("/:id/moderation-logs", requireAuth, getModerationLogsController);
router.put("/:id/settings", requireAuth, updateCommunitySettingsController);

// Admin routes (require admin role)
router.get("/admin/all", requireAuth, requireAdmin, getAllCommunitiesAdminController);
router.put("/admin/:id/approve", requireAuth, requireAdmin, approveCommunityController);
router.put("/admin/:id/reject", requireAuth, requireAdmin, rejectCommunityController);
router.put("/admin/:id/suspend", requireAuth, requireAdmin, suspendCommunityController);
router.delete("/admin/:id/delete", requireAuth, requireAdmin, deleteCommunityController);

export default router;
