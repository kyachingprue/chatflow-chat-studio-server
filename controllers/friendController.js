import { User } from '../models/userModels.js';

// Get users not friends
export const getUsersNotFriends = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Get all users except current
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      '_id username email image friendRequests friends'
    );

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Friend Request
export const addFriend = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    // Prevent duplicate request
    if (
      targetUser.friendRequests.includes(currentUserId) ||
      targetUser.friends.includes(currentUserId)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Friend request already sent or already friends',
        });
    }

    // Add request
    targetUser.friendRequests.push(currentUserId);
    await targetUser.save();

    return res
      .status(200)
      .json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Friend or Cancel Request
export const removeFriend = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    // Remove from friends and friendRequests
    targetUser.friends = targetUser.friends.filter(
      id => id.toString() !== currentUserId
    );
    targetUser.friendRequests = targetUser.friendRequests.filter(
      id => id.toString() !== currentUserId
    );

    await targetUser.save();

    return res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all friend requests sent to the logged-in user
export const getReceivedFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const users = await User.find({ friendRequests: currentUserId }).select('_id username image email');
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { senderId } = req.body;

    // Add each other as friends
    await User.findByIdAndUpdate(currentUserId, { $push: { friends: senderId }, $pull: { friendRequests: senderId } });
    await User.findByIdAndUpdate(senderId, { $push: { friends: currentUserId } });

    return res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { senderId } = req.body;

    await User.findByIdAndUpdate(currentUserId, { $pull: { friendRequests: senderId } });
    return res.status(200).json({ success: true, message: "Friend request rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};