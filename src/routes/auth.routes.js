import express from 'express';
import { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile,googleLogin, googleRegister, verifyPassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { deleteProfileField, updateProfile } from '../controllers/profile.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/google/login', googleLogin);
router.post('/google/register', googleRegister);
router.post('/verify-password', verifyPassword);
export default router;