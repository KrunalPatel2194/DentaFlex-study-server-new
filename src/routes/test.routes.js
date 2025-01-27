// test.routes.js
import express from 'express';
import { submitTestResult, getTestResults } from '../controllers/testResult.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/results', authenticate, submitTestResult);
router.get('/results', authenticate, getTestResults);

export default router;