// src/routes/topic.routes.js
import express from 'express';
import { createTopic, getTopicsBySubject } from '../controllers/topic.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/topics', authenticate, createTopic);
router.get('/topics/subject/:subjectId', authenticate, getTopicsBySubject);

export default router;
