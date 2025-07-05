import express from "express";
import {
  sendMessageController,
  getConversationController,
  getUserConversationsController,
  getUnreadCountController,
  markMessagesAsReadController,
  getAllUsersForMessagingController,
  getAdminUsersController
} from "../controller/Message.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Protected routes (require authentication)
// Send a new message
router.post("/send", requireSignIn, sendMessageController);

// Get conversation with a specific user
router.get("/conversation/:userId", requireSignIn, getConversationController);

// Get user's conversations list
router.get("/conversations", requireSignIn, getUserConversationsController);

// Get unread message count
router.get("/unread-count", requireSignIn, getUnreadCountController);

// Mark messages as read
router.put("/mark-read/:userId", requireSignIn, markMessagesAsReadController);

// Get admin users for regular users to contact
router.get("/admins", requireSignIn, getAdminUsersController);

// Admin routes
// Get all users for messaging (admin only)
router.get("/admin/users", requireSignIn, isAdmin, getAllUsersForMessagingController);

export default router;
