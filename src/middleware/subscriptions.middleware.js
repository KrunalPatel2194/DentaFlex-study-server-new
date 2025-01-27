// middleware/subscription.middleware.js
import { Subscription } from '../models/subscriptions/subscription.model.js';
import FieldOfStudy from '../models/fieldOfStudy.model.js';
import Exam from '../models/exam.model.js';

export const checkSubscriptionAccess = async (req, res, next) => {
  try {
    const { fieldOfStudy, examName } = req.params;
    const userId = req.userId;

    // Get examId from fieldOfStudy and examName
    const field = await FieldOfStudy.findOne({ name: fieldOfStudy });
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const exam = await Exam.findOne({ 
      fieldOfStudy: field._id,
      name: examName 
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Find active subscription
    const subscription = await Subscription.findOne({
      userId,
      examId: exam._id,
      status: 'active',
      expiryDate: { $gt: new Date() }
    });

    console.log('Subscription check:', {
      userId,
      examId: exam._id,
      subscription: subscription?.type || null
    });

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};