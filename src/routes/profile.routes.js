import express from 'express';
import { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { deleteProfileField, updateProfile,saveExamPreference,getExamPreference } from '../controllers/profile.controller.js';

const router = express.Router();

// Profile routes
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.delete('/:field', authenticate, deleteProfileField);
router.put('/save-preference', authenticate, saveExamPreference);
router.get('/:userId', getExamPreference);
export default router;