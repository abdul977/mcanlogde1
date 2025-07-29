import express from "express";
import {
  joinCommunityController,
  leaveCommunityController,
  getCommunityMembersController,
  addModeratorController,
  removeModeratorController,
  kickMemberController,
  banMemberController,
  unbanMemberController,
  muteMemberController
} from "../controller/CommunityMember.js";
import { requireAuth, requireAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Community member routes (require authentication)
router.post("/:communityId/join", requireAuth, joinCommunityController);
router.post("/:communityId/leave", requireAuth, leaveCommunityController);
router.get("/:communityId/members", requireAuth, getCommunityMembersController);

// Moderator management routes (require creator/admin permissions)
router.put("/:communityId/moderators/:userId/add", requireAuth, addModeratorController);
router.put("/:communityId/moderators/:userId/remove", requireAuth, removeModeratorController);

// Moderation action routes (require moderator/creator/admin permissions)
router.put("/:communityId/members/:userId/kick", requireAuth, kickMemberController);
router.put("/:communityId/members/:userId/ban", requireAuth, banMemberController);
router.put("/:communityId/members/:userId/unban", requireAuth, unbanMemberController);
router.put("/:communityId/members/:userId/mute", requireAuth, muteMemberController);

export default router;
