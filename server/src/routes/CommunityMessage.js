import express from "express";
import multer from "multer";
import { 
  sendMessageController,
  getCommunityMessagesController,
  deleteMessageController,
  togglePinMessageController
} from "../controller/CommunityMessage.js";
import { requireAuth } from "../middlewares/Auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'src/uploads/temp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Max 5 files per message
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
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
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Community message routes (all require authentication)
router.post("/:communityId/send", 
  requireAuth, 
  upload.array('attachments', 5), 
  sendMessageController
);

router.get("/:communityId/messages", requireAuth, getCommunityMessagesController);

router.delete("/message/:messageId", requireAuth, deleteMessageController);

router.put("/message/:messageId/pin", requireAuth, togglePinMessageController);

export default router;
