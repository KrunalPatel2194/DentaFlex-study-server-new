// src/routes/test.routes.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTest,
  updateTest,
  deleteTest,
  addQuestion,
  deleteQuestion,
  addTest,
  getTestDetails
} from '../controllers/tests.controller.js';

const router = express.Router();

// Test management routes
router.post('/tests', authenticate, addTest); // Create a test
router.put('/tests/:testId', authenticate, updateTest); // Update a test
router.get('/tests/:testId', authenticate, getTestDetails); // Update a test

router.delete('/tests/:testId', authenticate, deleteTest); // Delete a test

// Question management routes
router.post('/tests/:testId/questions', authenticate, addQuestion); // Add a question
router.delete('/tests/:testId/questions/:questionId', authenticate, deleteQuestion); // Delete a question

export default router;
