// controllers/friendController.js
import { User } from '../models/userModels.js';

export const getUsersNotFriends = async (req, res) => {
  try {
    const currentUserId = req.userId; 

    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      '_id username email image'
    );

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
