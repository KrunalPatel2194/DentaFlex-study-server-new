// testResult.model.js
import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'UserId is required']
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'TestId is required']
  },
  testType: {
    type: String,
    enum: ['mock-test', 'self-assessment'],
    required: [true, 'Test type is required']
  },
  answers: {
    type: Map,
    of: String,
    required: [true, 'Answers are required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions count is required']
  },
  correctAnswers: {
    type: Number,
    required: [true, 'Correct answers count is required']
  },
  timeTaken: {
    type: Number,
    required: [true, 'Time taken is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('TestResult', testResultSchema);