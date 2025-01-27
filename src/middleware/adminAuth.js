import { AuthError } from './error.js';
import User from '../models/user.model.js';

export const adminAuth = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user || (!['admin', 'superadmin'].includes(user.role))) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };