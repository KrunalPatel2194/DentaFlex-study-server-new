import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: { type: String, required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    type: { type: String, enum: ['self-assessment', 'mock-test'], required: true }, // Test type
    questions: [
      {
        questionText: { type: String, required: true },
        options: [String],
        correctAnswer: String,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Test = mongoose.model('Test', testSchema);
  export default Test;
  

