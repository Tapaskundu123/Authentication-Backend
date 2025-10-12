// Models/tempUser.model.js
import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOtp: {
    type: String,
    default: '',
  },
  verifyOtpExpiredAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Changed to 10 minutes to allow for OTP verification
  },
});
const tempUserModel = mongoose.models.TempUsers || mongoose.model('TempUsers', tempUserSchema);

export { tempUserModel };