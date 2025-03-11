// routes/admin.routes.js
import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/Admin/main.js';
import { generateExam, getGeneratedExams } from '../controllers/Admin/generateQuestionsController.js';
const router = express.Router();

// Apply adminAuth middleware to all routes
router.use(adminAuth);

// Field of Study Routes
router.post('/fields-of-study', adminController.createFieldOfStudy);
router.get('/fields-of-study', adminController.getAllFieldsOfStudyWithExams);

// Exam Routes
router.post('/exams', adminController.createExam);
router.get('/exams/:examId', adminController.getExamWithContent);
router.get('/exams', adminController.getAllExams);
router.put('/exams/:id', adminController.updateExam);
router.delete('/exams/:id', adminController.deleteExam);
// router.get('/exams/:id', adminController.getExamDe);
// Subject Routes
// Individual subject creation
router.get('/subjects', adminController.getAllSubjects);
router.get('/subjects/:id', adminController.getSubjectById);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);
// Topic Routes
router.post('/topics', adminController.createTopic);
router.get('/topics', adminController.getAllTopics);
router.get('/topics/:id', adminController.getTopicById);
router.put('/topics/:id', adminController.updateTopic);
router.delete('/topics/:id', adminController.deleteTopic);
router.get('/subjects/:subjectId/topics', adminController.getTopicsBySubject);
// Subtopic Routes
router.get('/subtopics', adminController.getAllSubtopics);
router.get('/subtopics/:id', adminController.getSubtopicById);
router.post('/subtopics', adminController.createSubtopic);
router.put('/subtopics/:id', adminController.updateSubtopic);
router.delete('/subtopics/:id', adminController.deleteSubtopic);
// Batch creation of subject with topics and subtopics
router.post('/subjects/batch', adminController.createSubjectWithTopicsAndSubtopics);

// Topic Routes
// router.post('/topics', adminController.createTopic);

// Batch creation of topic with subtopics
router.post('/topics/batch', adminController.createTopicWithSubtopics);

// Subtopic Routes
// router.post('/subtopics', adminController.createSubtopic);


//Content Audit Entries
router.post('/content-audit', adminController.createAuditEntry);
router.get('/content-audit', adminController.getAuditEntries);
router.get('/content-audit/:id', adminController.getAuditEntry);
router.post('/content-audit/:auditId/parse', adminController.updateContentAuditController);

router.post('/generated-exams', getGeneratedExams);
router.post('/generate-exam', generateExam);
export default router;

// In your main app.js or index.js
/*
import adminRoutes from './routes/admin.routes.js';
app.use('/api/admin', adminRoutes);
*/