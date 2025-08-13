import express from "express";
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
import { requirePermission, requireAnyPermission } from "../middlewares/PermissionAuth.js";
import { requireUserManagementPermission } from "../middlewares/RoleHierarchy.js";
import { requireResourceAccess } from "../middlewares/ResourceOwnership.js";
import { validatePasswordPolicy, checkPasswordHistoryMiddleware } from "../middlewares/PasswordValidation.js";
import { authRateLimit, passwordResetRateLimit, resetRateLimitOnSuccess } from "../middlewares/RateLimit.js";
import { requireMFAForRole, requireMFAForAction } from "../middlewares/MFAEnforcement.js";

const router = express.Router();

// Public routes with rate limiting and validation
router.post("/register",
  authRateLimit,
  validatePasswordPolicy,
  checkPasswordHistoryMiddleware,
  registerController
);
router.post("/login",
  authRateLimit,
  resetRateLimitOnSuccess,
  loginController
);
router.get('/user', getUserInfo);

// Protected user routes with RBAC
router.get("/profile",
  requireSignIn,
  requireResourceAccess('users', { action: 'read' }),
  getUserProfile
);
router.put("/profile",
  requireSignIn,
  requireResourceAccess('users', { action: 'update' }),
  validatePasswordPolicy,
  checkPasswordHistoryMiddleware,
  updateUserProfile
);
// Using express-fileupload (configured globally) instead of multer for profile picture uploads
router.put("/profile/picture",
  requireSignIn,
  requireResourceAccess('users', { action: 'update' }),
  updateProfilePictureController
);
router.post("/refresh", requireSignIn, refreshTokenController);
router.post("/logout", requireSignIn, logoutController);

// Protected authentication check routes
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// Admin authentication check with new RBAC and MFA
router.get("/admin-auth",
  requireSignIn,
  requireMFAForRole,
  requireAnyPermission([
    { resource: 'users', action: 'manage' },
    { resource: 'settings', action: 'update' },
    { resource: 'audit_logs', action: 'read' }
  ]),
  (req, res) => {
    res.status(200).send({
      ok: true,
      mfaVerified: req.mfaInfo?.verified || false
    });
  }
);

export default router;
