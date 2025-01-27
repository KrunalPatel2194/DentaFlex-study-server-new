// controllers/paymentPackage.controller.js
import {PaymentPackage}  from '../../models/subscriptions/paymentPackage.model.js';

export const createPackage = async (req, res) => {
  try {
    const { examId, name, type, price, mockTestCount, duration } = req.body;
    const packages = new PaymentPackage({
      examId, name, type, price, mockTestCount, duration
    });
    await packages.save();
    res.status(201).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamPackages = async (req, res) => {
  try {
    const { examId } = req.params;
    const packages = await PaymentPackage.find({ 
      examId, 
      isActive: true 
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const updates = req.body;
    const packages = await PaymentPackage.findByIdAndUpdate(
      packageId,
      updates,
      { new: true }
    );
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};