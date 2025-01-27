// src/routes/subtopic.routes.js
import express from 'express';
import { createSubtopic, getSubtopicsByTopic } from '../controllers/subtopic.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/subtopics', authenticate, createSubtopic);
router.get('/subtopics/topic/:topicId', authenticate, getSubtopicsByTopic);

export default router;
