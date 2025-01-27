import express from 'express';
import { getCompleteExamStructure, getExamProgress, getSubtopicContent,getExamHierarchy,getTopicWithContent,getSubjectContent, getMockTest, getSelfAssessment  } from '../controllers/study.controller.js';
import { getTestResultByTestId, getTestResults, submitTestResult } from '../controllers/testResult.controller.js';
import { authenticate } from '../middleware/auth.js';
import FieldOfStudy from '../models/fieldOfStudy.model.js';
import Exam from '../models/exam.model.js';
import { checkAccess } from '../controllers/Subscriptions/subscription.controller.js';
import { checkSubscriptionAccess } from '../middleware/subscriptions.middleware.js';

const router = express.Router();
router.get('/subjects/:subjectId/content', getSubjectContent);
router.get('/topics/:topicId/content', getTopicWithContent);
router.get('/subtopics/:subtopicId/content', getSubtopicContent);
// router.get('/subjects/:subjectId/content',getSubjectContent);
router.get('/exams/:examId/complete-structure', getCompleteExamStructure);
router.get('/exams/:examId/progress', getExamProgress); // Optional progress endpoint
// router.get('/structure/:fieldOfStudy/:examName', getExamHierarchy);
router.get('/structure/:fieldOfStudy/:examName', 
    authenticate, 
    checkSubscriptionAccess,
    getExamHierarchy
  );
router.get('/tests/self-assessment/:assessmentId/content', getSelfAssessment);
router.get('/tests/mock-tests/:mockTestId/content', getMockTest);
router.post('/tests/results', submitTestResult);
router.get('/tests/results', getTestResults);
router.get('/tests/results/:testId', authenticate, getTestResultByTestId);

export default router;