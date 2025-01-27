// src/models/topic.model.js
import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String }, // HTML text content of the topic
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  isPublic: {
    type: Boolean,
    default: false
  },
  subtopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' }], // References to subtopics
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
