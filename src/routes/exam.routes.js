// src/routes/exam.routes.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createExam,
  addTestToExam,
  getTestsByExam,
  updateExam,
  deleteExam,
//   getExamsByFieldOfStudy,
getExamsByFieldOfStudy,
  getExamDetailsWithHierarchy,
  getExamSummary ,
  getExamByfieldNameandExamName
} from '../controllers/exam.controller.js';

const router = express.Router();

// Exam routes
router.post('/', authenticate, createExam);
router.put('/:examId', authenticate, updateExam);
router.delete('/:examId', authenticate, deleteExam);
// router.get('/:examId', authenticate, deleteExam);

// router.get('/exams/field-of-study/:fieldOfStudyId', authenticate, getExamsByFieldOfStudy);
router.get('/byFieldOfStudy/:fieldId', getExamsByFieldOfStudy);
// Test routes for exams
router.post('/:examId/tests', authenticate, addTestToExam); // Add a test to an exam
router.get('/:examId/tests', authenticate, getTestsByExam); // Get tests for an exam
router.get('/:examId/details', authenticate, getExamDetailsWithHierarchy);
router.get('/:examId/summary', getExamSummary);
router.get('/byFieldAndExam/:fieldName/:examName', getExamByfieldNameandExamName);
export default router;
