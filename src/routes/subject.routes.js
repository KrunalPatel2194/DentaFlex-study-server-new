// src/routes/subject.routes.js
import express from 'express';
import { createSubject, getSubjectsByExam } from '../controllers/subject.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/subjects', authenticate, createSubject);
router.get('/subjects/exam/:examId', authenticate, getSubjectsByExam);

export default router;
