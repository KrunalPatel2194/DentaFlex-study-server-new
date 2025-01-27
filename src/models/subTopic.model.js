// src/models/subtopic.model.js
import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String }, // HTML text content of the subtopic
  isPublic: {
    type: Boolean,
    default: false
  },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true }, // Reference to the parent topic
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Subtopic = mongoose.model('Subtopic', subtopicSchema);

export default Subtopic;
