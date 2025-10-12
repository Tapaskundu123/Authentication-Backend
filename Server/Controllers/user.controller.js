// Controllers/user.controller.js
import { userModel } from '../Models/user.model.js';

export const getUserData = async (req, res) => {
  try {
    const userId = req.user?.id; // Fixed: Get from req.user not req.body
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const User = await userModel.findById(userId).select('-password');
    if (!User) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      userData: {
        name: User.name,
        email: User.email,
        isAccountVerified: User.isEmailVerified,
      }
    });
  } catch (err) {
    console.error('getUserData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};