import express from "express";
import multer from "multer";
import {
  createCommunityController,
  getAllCommunitiesController,
  getCommunityController,
  getCommunityByIdController,
  getUserCommunitiesController,
  updateCommunityController,
  getAllCommunitiesAdminController,
  approveCommunityController,
  rejectCommunityController,
  suspendCommunityController
} from "../controller/ChatCommunity.js";
import { requireAuth, requireAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'src/uploads/temp/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Max 2 files (avatar + banner)
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get("/", getAllCommunitiesController);
router.get("/by-id/:id", getCommunityByIdController); // New route for getting by ID
router.get("/:slug", getCommunityController);

// Protected routes (require authentication)
router.post("/create", 
  requireAuth, 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]), 
  createCommunityController
);

router.get("/user/my-communities", requireAuth, getUserCommunitiesController);

router.put("/:id",
  requireAuth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  updateCommunityController
);

// Admin routes (require admin role)
router.get("/admin/all", requireAuth, requireAdmin, getAllCommunitiesAdminController);
router.put("/admin/:id/approve", requireAuth, requireAdmin, approveCommunityController);
router.put("/admin/:id/reject", requireAuth, requireAdmin, rejectCommunityController);
router.put("/admin/:id/suspend", requireAuth, requireAdmin, suspendCommunityController);

export default router;
