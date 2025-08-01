import express from "express";
import multer from "multer";
import {
  getUserInfo,
  loginController,
  registerController,
  getUserProfile,
  updateUserProfile,
  updateProfilePictureController,
  refreshTokenController,
  logoutController
} from "../controller/User.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

// Configure multer for profile picture uploads
const upload = multer({
  dest: 'src/uploads/temp/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
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

const router = express.Router();

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get('/user', getUserInfo);

// Protected user routes
router.get("/profile", requireSignIn, getUserProfile);
router.put("/profile", requireSignIn, updateUserProfile);
router.put("/profile/picture", requireSignIn, upload.single('profileImage'), updateProfilePictureController);
router.post("/refresh", requireSignIn, refreshTokenController);
router.post("/logout", requireSignIn, logoutController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

export default router;
