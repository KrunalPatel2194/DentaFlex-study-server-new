import { AuthError } from './error.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
export const adminAuth = async (req, res, next) => {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId);
     
      if (!user || (!['admin', 'superadmin'].includes(user.role))) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };