// subscription.controller.js
import { Subscription } from '../../models/subscriptions/subscription.model.js';
import { PaymentPackage } from '../../models/subscriptions/paymentPackage.model.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Placeholder for payment gateway integration
const processPayment = async (amount, paymentDetails) => {
  // Simulate payment processing
  return {
    success: true,
    transactionId: Math.random().toString(36).substring(7)
  };
};

export const purchaseSubscription = async (req, res) => {
    try {
      const { packageId, paymentMethodId } = req.body;
      const userId = req.userId;
  
      const packages = await PaymentPackage.findById(packageId);
      if (!packages || !packages.isActive) {
        return res.status(404).json({ message: 'Package not available' });
      }
  
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: packages.price * 100, // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
      });
  
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment failed' });
      }
  
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + packages.duration);
  
      // Create subscription
      const subscription = new Subscription({
        userId,
        examId: packages.examId,
        type: packages.type,
        expiryDate,
        transactionId: paymentIntent.id,
        mockTestPackages: packages.mockTestCount ? [{
          packageId: packages._id,
          testsTotal: packages.mockTestCount,
          testsRemaining: packages.mockTestCount
        }] : []
      });
  
      await subscription.save();
  
      res.status(201).json({
        success: true,
        message: 'Subscription purchased successfully',
        subscription
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
  export const createPaymentIntent = async (req, res) => {
    try {
      const { packageId } = req.body;
      const packages = await PaymentPackage.findById(packageId);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(packages.price * 100),
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          packageId,
          userId: req.userId
        }
      });
  
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        success: true 
      });
    } catch (error) {
      console.error('Payment Intent Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };
export const addMockTestPackage = async (req, res) => {
  try {
    const { subscriptionId, packageId, paymentDetails } = req.body;
    const userId = req.userId;

    const subscription = await Subscription.findOne({ _id: subscriptionId, userId });
    if (!subscription || !subscription.isActive()) {
      return res.status(404).json({ message: 'Active subscription not found' });
    }

    const packages = await PaymentPackage.findById(packageId);
    if (!packages || !packages.isActive || packages.type !== 'mock') {
      return res.status(404).json({ message: 'Package not available' });
    }

    // Process payment
    const paymentResult = await processPayment(packages.price, paymentDetails);
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    // Add mock test package
    subscription.mockTestPackages.push({
      packageId: packages._id,
      testsTotal: packages.mockTestCount,
      testsRemaining: packages.mockTestCount
    });

    await subscription.save();

    res.json({
      message: 'Mock test package added successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkAccess = async (req, res) => {
  try {
    const { examId, contentType, contentId } = req.body;
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      userId,
      examId,
      status: 'active',
      expiryDate: { $gt: new Date() }
    });

    const hasAccess = Boolean(subscription);

    res.json({
      hasAccess,
      subscription: subscription || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptions = await Subscription.find({ userId })
      .populate('examId', 'name')
      .sort('-createdAt');

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// subscription.controller.js
export const handleSuccessfulPayment = async (req, res) => {
    try {
      const { paymentIntentId, packageId } = req.body;
      const userId = req.userId;
  
      const packages = await PaymentPackage.findById(packageId);
      if (!packages) {
        return res.status(404).json({ 
          success: false, 
          message: 'Package not found' 
        });
      }
  
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + packages.duration);
  
      // Create subscription
      const subscription = new Subscription({
        userId,
        examId: packages.examId,
        type: packages.type,
        status: 'active',
        expiryDate,
        transactionId: paymentIntentId,
        mockTestPackages: packages.mockTestCount ? [{
          packageId: packages._id,
          testsTotal: packages.mockTestCount,
          testsRemaining: packages.mockTestCount
        }] : []
      });
  
      await subscription.save();
  
      res.json({
        success: true,
        subscription
      });
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };