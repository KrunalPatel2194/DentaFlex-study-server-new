import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
export const bulkCreateAdmins = async (req, res) => {
    try {
      const { admins } = req.body;
  
      if (!Array.isArray(admins) || admins.length === 0) {
        return res.status(400).json({ message: 'No admins provided' });
      }
  
      // Hash passwords (optional if the API auto-generates passwords)
      const hashedAdmins = await Promise.all(
        admins.map(async (admin) => {
          const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
          return { ...admin, password: hashedPassword, role: 'admin' };
        })
      );
  
      // Bulk insert
      const createdAdmins = await User.insertMany(hashedAdmins);
      res.status(201).json({ message: 'Admins created successfully', createdAdmins });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating admins', error });
    }
  };