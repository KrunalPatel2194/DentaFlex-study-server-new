import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  purchaseSubscription, 
  addMockTestPackage,
  checkAccess,
  getUserSubscriptions, 
  createPaymentIntent,
  handleSuccessfulPayment
} from '../controllers/Subscriptions/subscription.controller.js';
import {
  createPackage,
  getExamPackages,
  updatePackage
} from '../controllers/Subscriptions/paymentPackage.controller.js';

const router = express.Router();

// Payment Package routes
router.post('/packages', authenticate, createPackage);
router.get('/packages/exam/:examId', authenticate, getExamPackages);
router.patch('/packages/:packageId', authenticate, updatePackage);

// Subscription routes
router.post('/purchase', authenticate, purchaseSubscription);
router.post('/mock-package', authenticate, addMockTestPackage);
router.get('/check-access', authenticate, checkAccess);
router.get('/user', authenticate, getUserSubscriptions);

//paytment routes 
router.post('/create-payment-intent', authenticate, createPaymentIntent);
router.post('/payment-success', authenticate, handleSuccessfulPayment);
export default router;