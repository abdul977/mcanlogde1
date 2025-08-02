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

// Middleware to handle multipart form parsing errors
const handleMultipartErrors = (req, res, next) => {
  // Check if the request has multipart content-type
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    console.log('📝 Processing multipart form data...');
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📏 Content-Length:', req.headers['content-length']);

    // Add timeout handling
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error('❌ Multipart parsing timeout');
        return res.status(408).json({
          success: false,
          message: 'Request timeout while processing form data'
        });
      }
    }, 30000); // 30 second timeout

    // Clear timeout when response is sent
    res.on('finish', () => clearTimeout(timeout));
  }
  next();
};

// Middleware to validate file uploads (works with express-fileupload)
const validateCommunityFiles = (req, res, next) => {
  try {
    console.log('🔍 Validating community files...');
    console.log('📁 Files received:', req.files ? Object.keys(req.files) : 'No files');
    console.log('📋 Body fields:', req.body ? Object.keys(req.body) : 'No body');

    // Check if files exist and validate them
    if (req.files) {
      const { avatar, banner } = req.files;

      // Validate avatar if present
      if (avatar) {
        console.log('🖼️ Validating avatar:', {
          name: avatar.name,
          size: avatar.size,
          mimetype: avatar.mimetype
        });

        if (!avatar.mimetype || !avatar.mimetype.startsWith('image/')) {
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
        console.log('🏞️ Validating banner:', {
          name: banner.name,
          size: banner.size,
          mimetype: banner.mimetype
        });

        if (!banner.mimetype || !banner.mimetype.startsWith('image/')) {
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

    console.log('✅ File validation passed');
    next();
  } catch (error) {
    console.error('❌ File validation error:', error);
    console.error('📋 Request body:', req.body);
    console.error('📁 Request files:', req.files);

    res.status(400).json({
      success: false,
      message: 'Error validating uploaded files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Validation failed'
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
  handleMultipartErrors,
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
router.post("/admin/create",
  requireAuth,
  requireAdmin,
  handleMultipartErrors,
  validateCommunityFiles,
  createCommunityController
);
router.get("/admin/:id", requireAuth, requireAdmin, getCommunityByIdController);
router.put("/admin/:id/edit",
  requireAuth,
  requireAdmin,
  handleMultipartErrors,
  validateCommunityFiles,
  updateCommunityController
);
router.put("/admin/:id/approve", requireAuth, requireAdmin, approveCommunityController);
router.put("/admin/:id/reject", requireAuth, requireAdmin, rejectCommunityController);
router.put("/admin/:id/suspend", requireAuth, requireAdmin, suspendCommunityController);
router.delete("/admin/:id/delete", requireAuth, requireAdmin, deleteCommunityController);

export default router;
