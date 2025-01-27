// src/controllers/auth.controller.js
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { AuthError } from '../middleware/error.js';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
console.log(client,"client ID")
// Add 'export' keyword to each function
export const register = async (req, res, next) => {
    try {
      const { email, password, name, username } = req.body;
  
      // Validate required fields
      if (!email || !password || !name) {
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

export const getProfile = async (req, res, next) => {

  console.log(req.userId, "req.userId")
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      throw new AuthError('User not found');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Generate 6-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  export const forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        throw new AuthError('Email is required');
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // For security, don't reveal if email exists
        return res.json({
          message: 'If your email is registered, you will receive a password reset code.'
        });
      }
  
      // Generate verification code
      const resetCode = generateVerificationCode();
      const resetCodeExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
  
      // Save to user
      user.resetPasswordCode = resetCode;
      user.resetPasswordCodeExpires = resetCodeExpires;
      await user.save();
  
      // Send email
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Code - DENTAFLEX',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #033F6A;">Password Reset Request</h2>
            <p>You have requested to reset your password. Use the following verification code:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
              <h1 style="color: #033F6A; letter-spacing: 5px;">${resetCode}</h1>
            </div>
            <p>This code will expire in 20 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This is an automated message, please do not reply.
            </p>
          </div>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({
        message: 'Password reset code has been sent to your email.'
      });
  
    } catch (error) {
      next(error);
    }
  };
  export const verifyResetCode = async (req, res, next) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        throw new AuthError('Email and verification code are required');
      }
  
      const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordCodeExpires: { $gt: Date.now() }
      });
      if (!user) {
        throw new AuthError('Invalid or expired verification code');
      }
  
      res.json({
        message: 'Verification code is valid',
        verified: true
      });
  
    } catch (error) {
      next(error);
    }
  };
  
  export const resetPassword = async (req, res, next) => {
    try {
      const { email, code, newPassword } = req.body;
  
      if (!email || !code || !newPassword) {
        throw new AuthError('Email, verification code, and new password are required');
      }
  
      const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordCodeExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        throw new AuthError('Invalid or expired verification code');
      }
  
      // Update password
      user.password = newPassword;
      // Clear reset code fields
      user.resetPasswordCode = undefined;
      user.resetPasswordCodeExpires = undefined;
      await user.save();
  
      // Send confirmation email
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Successfully Reset - DENTAFLEX',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #033F6A;">Password Reset Successful</h2>
            <p>Your password has been successfully reset.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
          </div>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({
        message: 'Password has been successfully reset'
      });
  
    } catch (error) {
      next(error);
    }
  };

  // export const googleLogin = async (req, res) => {
  //   try {
  //     const { access_token, email } = req.body;
  
  //     // Verify the token
  //     const ticket = await client.verifyIdToken({
  //       idToken: access_token,
  //       audience: process.env.GOOGLE_CLIENT_ID
  //     });
  
  //     const payload = ticket.getPayload();
      
  //     // Verify email matches
  //     if (payload.email !== email) {
  //       return res.status(400).json({ message: 'Email verification failed' });
  //     }
  
  //     // Find user by email
  //     let user = await User.findOne({ email: payload.email });
      
  //     if (!user) {
  //       return res.status(404).json({
  //         message: 'No account found with this Google email. Please sign up first.'
  //       });
  //     }
  
  //     // Generate JWT token
  //     const token = generateToken(user._id);
      
  //     // Return user data and token
  //     res.json({
  //       token,
  //       user: {
  //         id: user._id,
  //         email: user.email,
  //         name: user.name,
  //         photo: user.photo,
  //         selectedExam: user.selectedExam,
  //         fieldOfStudy: user.fieldOfStudy
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Google login error:', error);
  //     res.status(500).json({ message: 'Authentication failed' });
  //   }
  // };
  
export const googleLogin = async (req, res) => {
  try {
    // console.log(req.body);
    const { credential } = req.body; // Changed from idToken to credential

    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }
    // console.log("credentials", credential)
    // Verify the credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not found
      const randomPassword = Math.random().toString(36).slice(-8);
      
      user = new User({
        email,
        name,
        photo: picture,
        googleId,
        password: randomPassword, // Will be hashed by the pre-save middleware
        provider: 'google',
      });
      await user.save();
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log({
      id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      selectedExam: user.selectedExam,
      fieldOfStudy: user.fieldOfStudy
    },"USER")
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        selectedExam: user.selectedExam,
        fieldOfStudy: user.fieldOfStudy
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Authentication failed' 
    });
  }
};
// Add this to auth.controller.js

export const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.userId; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    const isMatch = await user.comparePassword(password);
    
    res.json({ isValid: isMatch });
  } catch (error) {
    next(error);
  }
};
export const googleRegister = async (req, res) => {
  try {
    const { credential } = req.body; // Changed from access_token to credential

    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    // Verify the credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { 
      email, 
      name, 
      picture, 
      given_name, 
      family_name,
      sub: googleId 
    } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);

    // Create new user
    user = new User({
      email,
      password: randomPassword, // Will be hashed by the pre-save middleware
      name,
      fullName: name,
      photo: picture,
      googleId,
      status: 'private',
      firstName: given_name,
      lastName: family_name,
      provider: 'google',
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        selectedExam: user.selectedExam,
        fieldOfStudy: user.fieldOfStudy
      }
    });
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed' 
    });
  }
};