// Models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verifyOtp: {
    type: String,
    default: ''
  },
  verifyOtpExpiredAt: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetOTP: {
    type: String,
    default: ''
  },
  resetOTPExpiredAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const userModel = mongoose.models.Users || mongoose.model('Users', userSchema);

export { userModel };