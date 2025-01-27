// src/controllers/googleAuth.controller.js
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, given_name, family_name, sub: googleId } = payload;

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Please sign up first.'
      });
    }

    // Generate JWT
    const token = generateToken(user._id);
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,  // for HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        photo: user.photo || picture
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

export const googleRegister = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, given_name, family_name, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: 'Account already exists. Please login instead.'
      });
    }

    // Create random password for Google users
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    user = new User({
      email,
      password: hashedPassword,
      name,
      firstName: given_name,
      lastName: family_name,
      photo: picture,
      googleId,
      isGoogleAccount: true
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};