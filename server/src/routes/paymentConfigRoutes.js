import express from 'express';
import {
  getPaymentConfiguration,
  updatePaymentConfiguration,
  getPaymentDetails,
  testPaymentConfiguration,
  resetPaymentConfiguration,
  getPaymentConfigurationHistory,
  validatePaymentMethod
} from '../controller/PaymentConfiguration.js';
import { requireSignIn, isAdmin } from '../middlewares/Auth.js';

const router = express.Router();

// Public routes (for users to get payment details)
router.get('/details', getPaymentDetails);

// Protected user routes
router.get('/current', requireSignIn, getPaymentConfiguration);

// Admin-only routes
router.get('/admin/config', requireSignIn, isAdmin, getPaymentConfiguration);
router.put('/admin/update', requireSignIn, isAdmin, updatePaymentConfiguration);
router.get('/admin/test', requireSignIn, isAdmin, testPaymentConfiguration);
router.post('/admin/reset', requireSignIn, isAdmin, resetPaymentConfiguration);
router.get('/admin/history', requireSignIn, isAdmin, getPaymentConfigurationHistory);
router.post('/admin/validate-method', requireSignIn, isAdmin, validatePaymentMethod);

export default router;
