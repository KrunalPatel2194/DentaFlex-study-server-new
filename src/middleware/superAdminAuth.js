import { AuthError } from './error.js';
import User from '../models/user.model.js';

export const superAdminAuth = async (req, res, next) => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Superadmin access required' });
    }
    next();
  };
