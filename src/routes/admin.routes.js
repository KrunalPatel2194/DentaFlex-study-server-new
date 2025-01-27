
import express from 'express';
// import { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import {   createAdmin,  createSuperAdmin ,getAllAdmins,login} from '../controllers/admin.controller.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { bulkCreateAdmins } from '../controllers/Admin/createAccounts.js';
const router = express.Router();
// Superadmin-only routes
router.post('/superadmin', createSuperAdmin);

// Admin routes
router.post('/admin', adminAuth, createAdmin);
router.get('/admins', adminAuth, getAllAdmins);
router.post('/create-admins', adminAuth,bulkCreateAdmins)

// Auth routes
router.post('/login', login);

export default router;