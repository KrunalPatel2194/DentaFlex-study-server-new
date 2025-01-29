
import express from 'express';
// import { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import {   createAdmin,  createSuperAdmin ,getAllAdmins,login} from '../controllers/admin.controller.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { bulkCreateAdmins } from '../controllers/Admin/createAccounts.js';
// import { createFieldsOfStudy } from '../controllers/Admin/createFieldOfStudy.js';
import { getAllFields } from '../services/fieldOfStudy.service.js';
import { createFieldOfStudy, getAllFieldsOfStudy, updateFieldOfStudy } from '../controllers/Admin/field-of-study.js';
import { createExam } from '../controllers/Admin/exam.js';
const router = express.Router();
// Superadmin-only routes
router.post('/superadmin', createSuperAdmin);

// Admin routes
router.post('/admin', adminAuth, createAdmin);
router.get('/admins', adminAuth, getAllAdmins);
router.post('/create-admins', adminAuth,bulkCreateAdmins);
// router.post('/create-field-of-study', adminAuth,createFieldsOfStudy);
router.get('/fields-of-study', adminAuth,getAllFieldsOfStudy);
router.put('/fields-of-study/:Id', adminAuth, updateFieldOfStudy)
router.post('/fields-of-study', adminAuth, createFieldOfStudy)

router.post('/exam', adminAuth, createExam);





// Auth routes
router.post('/login', login);

export default router;