
// paymentPackage.model.js
import mongoose from 'mongoose';
const paymentPackageSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['content_access', 'mock_access', 'full_access'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  mockTestCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in months
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const PaymentPackage = mongoose.model('PaymentPackage', paymentPackageSchema);
