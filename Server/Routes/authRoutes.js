// Routes/authRoutes.js
import express from 'express';
import {
  login, 
  register, 
  logout, 
  sendVerifyOtp, 
  verifyOtpChangePassword, 
  isAuthenticated, 
  verifyEmailChangePassword, 
  resetNewPassword, 
  resendOtp, 
  verifyRegistrationOtp
} from '../Controllers/auth.controllers.js';
import { UserAuthMiddleware, verifyTempToken } from '../middleware/userAuth.js';

const authrouter = express.Router();

authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.post('/logout', logout);
authrouter.post('/sendOtp', UserAuthMiddleware, sendVerifyOtp);
authrouter.post('/is-Auth', UserAuthMiddleware, isAuthenticated);
authrouter.post('/verify-Email-ChangePassword', verifyEmailChangePassword);
authrouter.post('/verify-OTP-changePassword', verifyOtpChangePassword);
authrouter.post('/reset-password', resetNewPassword);
authrouter.post('/resend-otp', resendOtp); // Fixed: Removed verifyResetToken
authrouter.post('/verify-registration-otp', verifyTempToken, verifyRegistrationOtp);

export default authrouter;