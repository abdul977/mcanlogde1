import express from 'express';
import {
  submitPaymentProof,
  getPaymentVerifications,
  verifyPayment,
  getUserPaymentHistory,
  getPaymentStatistics,
  downloadReceipt
} from '../controller/Payment.js';
import { requireSignIn, isAdmin } from '../middlewares/Auth.js';
import { uploadPaymentProof, handleUploadError } from '../utils/fileUpload.js';

const router = express.Router();

// User routes
router.post('/submit-proof',
  requireSignIn,
  uploadPaymentProof.single('paymentScreenshot'),
  handleUploadError,
  submitPaymentProof
);

router.get('/history',
  requireSignIn,
  getUserPaymentHistory
);
router.get('/receipt/:paymentId', requireSignIn, downloadReceipt);

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
