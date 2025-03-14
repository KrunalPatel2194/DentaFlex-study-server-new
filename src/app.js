import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler } from './middleware/error.js';
import fieldOfStudyRoutes from './routes/fieldOfStudy.routes.js';
import testsRoutes from './routes/tests.routes.js';
import examRoutes from './routes/exam.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import topicsRoutes from './routes/topic.routes.js';
import subTopicRoutes from './routes/subTopic.routes.js';
import studyRoutes from './routes/study.routes.js';
import subscriptionRoutes from './routes/subscriptions.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminMainRoutes from './routes/admin-main.routes.js';
import { corsMiddleware } from './cors.js';

const app = express();
// Apply custom CORS middleware first
app.use(corsMiddleware);

// Then parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/fields', fieldOfStudyRoutes);
app.use('/api', testsRoutes);
app.use('/api/exams', examRoutes);
app.use('/api', subjectRoutes);
app.use('/api', topicsRoutes);
app.use('/api/', subTopicRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-main', adminMainRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

export default app;