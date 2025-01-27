// src/models/subject.model.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Optional description of the subject
  content: { type: String },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }, // Reference to the exam
  isPublic: {
    type: Boolean,
    default: false
  },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }], // References to topics under this subject
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
