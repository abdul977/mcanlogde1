import express from 'express';
import {
  submitPaymentProof,
  getPaymentVerifications,
  verifyPayment,
  getUserPaymentHistory,
  getPaymentStatistics,
  downloadReceipt,
  exportPaymentsExcel,
  exportPaymentsCSV,
  getPaymentAuditTrail,
  getAuditStatistics
} from '../controller/Payment.js';
import { requireSignIn, isAdmin } from '../middlewares/Auth.js';

const router = express.Router();

// User routes - Using express-fileupload (configured in index.js)
router.post('/submit-proof',
  requireSignIn,
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

router.get('/admin/export/excel',
  requireSignIn,
  isAdmin,
  exportPaymentsExcel
);

router.get('/admin/export/csv',
  requireSignIn,
  isAdmin,
  exportPaymentsCSV
);

router.get('/admin/audit/:paymentId',
  requireSignIn,
  isAdmin,
  getPaymentAuditTrail
);

router.get('/admin/audit-statistics',
  requireSignIn,
  isAdmin,
  getAuditStatistics
);

export default router;
