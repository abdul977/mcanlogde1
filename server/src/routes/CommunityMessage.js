import express from "express";
import {
  sendMessageController,
  getCommunityMessagesController,
  deleteMessageController,
  togglePinMessageController
} from "../controller/CommunityMessage.js";
import { requireAuth } from "../middlewares/Auth.js";

const router = express.Router();

// Middleware to validate message attachments (works with express-fileupload)
const validateMessageAttachments = (req, res, next) => {
  try {
    // Check if files exist and validate them
    if (req.files && req.files.attachments) {
      const attachments = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      // Validate each attachment
      for (const file of attachments) {
        // Check file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `File type ${file.mimetype} is not allowed`
          });
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'File size must be less than 10MB'
          });
        }
      }

      // Check total number of files (max 5)
      if (attachments.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 files allowed per message'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Attachment validation error:', error);
    res.status(400).json({
      success: false,
      message: 'Error validating uploaded attachments'
    });
  }
};

// Community message routes (all require authentication)
router.post("/:communityId/send",
  requireAuth,
  validateMessageAttachments,
  sendMessageController
);

router.get("/:communityId/messages", requireAuth, getCommunityMessagesController);

router.delete("/message/:messageId", requireAuth, deleteMessageController);

router.put("/message/:messageId/pin", requireAuth, togglePinMessageController);

export default router;
