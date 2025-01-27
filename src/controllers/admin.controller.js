// controllers/admin.controller.js
import mongoose from 'mongoose';
import Exam from '../models/exam.model.js';
import Subject from '../models/subject.model.js';
import Topic from '../models/topic.model.js';
import Subtopic from '../models/subTopic.model.js';
import User from '../models/user.model.js';
import { AuthError } from '../middleware/error.js';
import {hashPassword} from '../utils/hashPassword.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const createSuperAdmin = async (req, res, next) => {
  try {
    const { email, password, name, username, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      throw new AuthError('Email, password, and name are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(username ? [{ username }] : [])  // Only check username if provided
      ]
    });

    if (existingUser) {
      throw new AuthError(
        existingUser.email === email ? 'Email already registered' : 'Username already taken'
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      username  // This will be undefined if not provided
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      next(new AuthError(`${field} already exists`));
    } else {
      next(error);
    }
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if requester is superadmin
    const requester = await User.findById(req.userId);
    if (!requester || requester.role !== 'superadmin') {
      throw new AuthError('Only super admin can create admins');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      isActive: true,
      provider: 'local'
    });
    
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthError('Invalid credentials');
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        selectedExam: user.selectedExam,
        fieldOfStudy: user.fieldOfStudy
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('-password');
    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    next(error);
  }
};