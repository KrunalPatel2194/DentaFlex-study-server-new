// src/models/exam.model.js
import mongoose from 'mongoose';
const examSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    fieldOfStudy: { type: mongoose.Schema.Types.ObjectId, ref: 'FieldOfStudy', required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Reference to Subject
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });
  
  const Exam = mongoose.model('Exam', examSchema);
  
export default Exam;
