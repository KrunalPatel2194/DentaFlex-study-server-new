import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  type: {
    type: String,
    enum: ['content_access', 'mock_access', 'full_access'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  mockTestPackages: [{
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentPackage'
    },
    testsTotal: Number,
    testsRemaining: Number,
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add index for quick lookups
subscriptionSchema.index({ userId: 1, examId: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.expiryDate > new Date();
};

// Method to check mock test availability
subscriptionSchema.methods.hasMockTestsRemaining = function(packageId) {
  const packages = this.mockTestPackages.find(p => p.packageId.equals(packageId));
  return packages && packages.testsRemaining > 0;
};

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
