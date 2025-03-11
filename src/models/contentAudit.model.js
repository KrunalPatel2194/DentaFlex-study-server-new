import mongoose from 'mongoose';

const contentAuditSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['submit', 'generate'],
    required: true
  },
  content: {
    fieldOfStudy: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      title: { type: String, required: true }
    },
    exam: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      title: { type: String, required: true }
    },
    subject: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      title: { type: String, required: true }
    },
    topics: [{
      name: { type: String, required: true },
      content: { type: String, default: '' },
      isPublic: { type: Boolean, default: false },
      subtopics: [{
        name: { type: String, required: true },
        content: { type: String, default: '' },
        isPublic: { type: Boolean, default: false }
      }]
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  error: String,
  aiResponse: {
    type: Object,
    default: null
  }
});

const ContentAudit = mongoose.model('ContentAudit', contentAuditSchema);

export default ContentAudit;