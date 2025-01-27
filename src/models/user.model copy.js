// src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {  // Add explicit username field if you need it
    type: String,
    unique: true,
    sparse: true,  // This allows multiple null values
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  resetPasswordCode: String,
  resetPasswordCodeExpires: Date,
}, {
  timestamps: true
});

// Add index with sparse option
// userSchema.index({ username: 1 }, { unique: true, sparse: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
      if (!this.isModified('password')) return next();
      
      
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      
      next();
    } catch (error) {
      next(error);
    }
  });

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      // Don't hash the candidatePassword - bcrypt.compare will handle it

      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
    } catch (error) {
      console.error('Password comparison error:', error);
      throw error;
    }
  };

const User = mongoose.model('User', userSchema);
export default User;