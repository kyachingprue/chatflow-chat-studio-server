import { User } from '../models/userModels.js';

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
