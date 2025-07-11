import express from 'express';
import { 
  submitPaymentProof, 
  getPaymentVerifications, 
  verifyPayment, 
  getUserPaymentHistory,
  getPaymentStatistics 
} from '../controller/Payment.js';
import { requireSignIn, isAdmin } from '../middleware/authMiddleware.js';
import { uploadPaymentScreenshot, handleUploadError } from '../utils/fileUpload.js';

const router = express.Router();

// User routes
router.post('/submit-proof', 
  requireSignIn, 
  uploadPaymentScreenshot.single('paymentScreenshot'),
  handleUploadError,
  submitPaymentProof
);

router.get('/history', 
  requireSignIn, 
  getUserPaymentHistory
);

// Admin routes
router.get('/admin/verifications', 
  requireSignIn, 
  isAdmin, 
  getPaymentVerifications
);

router.post('/admin/verify', 
  requireSignIn, 
  isAdmin, 
  verifyPayment
);

router.get('/admin/statistics', 
  requireSignIn, 
  isAdmin, 
  getPaymentStatistics
);

export default router;
