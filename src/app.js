import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler } from './middleware/error.js';
import fieldOfStudyRoutes  from './routes/fieldOfStudy.routes.js';
import testsRoutes from './routes/tests.routes.js';
import examRoutes from './routes/exam.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import topicsRoutes from './routes/topic.routes.js';
import subTopicRoutes from './routes/subTopic.routes.js';
import studyRoutes from './routes/study.routes.js';
import subscriptionRoutes from './routes/subscriptions.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminMainRoutes from './routes/admin-main.routes.js';

const app = express();
const allowedOrigins = [
  'https://dentaflex-study-admin-portal.vercel.app/',
  'http://localhost:3000',
  'http://localhost:3050', // Add your second allowed domain here
];
// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies or credentials
  })
);
app.options('/study/tests/results', cors());
app.use(express.json());



// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   next();
// });
// app.use((req, res, next) => {
//   console.log('Method:', req.method);
//   console.log('URL:', req.url);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body); // This will show the parsed body
//   next();
// });
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
app.use('/api/admin',adminRoutes);
app.use('/api/admin-main', adminMainRoutes)
// router.put('/save-preference', profileController.saveExamPreference);
// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Reduce timeout for faster failure detection
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT =  5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:5050');
});

export default app;