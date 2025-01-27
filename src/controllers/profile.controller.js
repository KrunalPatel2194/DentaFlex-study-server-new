import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { AuthError } from '../middleware/error.js';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();
export const getProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  export const updateProfile = async (req, res, next) => {
    try {
      const updates = req.body; // Example: { fullName: "John Doe", address: "123 Street" }
      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true }).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      next(error);
    }
  };

  export const deleteProfileField = async (req, res, next) => {
    try {
      const { field } = req.params; // Example: 'address'
      const updates = { [field]: undefined }; // Set the field to undefined
      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: `${field} removed successfully`, user });
    } catch (error) {
      next(error);
    }
  };
  export const saveExamPreference = async (req, res, next) => {
    try {
      const { userId, fieldOfStudy, selectedExam } = req.body;
  
      // Log the incoming data for debugging
      console.log("Received data to save exam preference:", {
        userId,
        fieldOfStudy,
        selectedExam,
      });
  
      // Update the user
      const user = await User.findByIdAndUpdate(
        userId,
        { fieldOfStudy, selectedExam },
        { new: true } // Returns the updated document
      );
  
      // Handle user not found
      if (!user) {
        console.error("User not found for ID:", userId);
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with success
      console.log("Preferences successfully saved for user:", user);
      res.status(200).json({ message: 'Preferences saved', user });
    } catch (error) {
      console.error("Error saving preferences:", error);
      next(error); // Pass the error to the error-handling middleware
    }
  };
  export const getExamPreference = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const preference = {
        fieldOfStudy: user.fieldOfStudy,
        selectedExam: user.selectedExam,
      };
  
      res.status(200).json(preference);
    } catch (error) {
      next(error);
    }
  };
  