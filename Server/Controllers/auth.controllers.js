// Controllers/auth.controllers.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userModel } from '../Models/user.model.js';
import { tempUserModel } from '../Models/tempUser.model.js';
import { transporter } from '../DB/nodemailer.js';

// Helper to sign tokens
const signToken = (payload, expiresIn = '7d') => jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn });

// ...existing code...
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Missing details' });

  let newTemp = null; // moved outside try so catch can reference it

  try {
    const existingUser = await userModel.findOne({ email });
    const existingTemp = await tempUserModel.findOne({ email });
    if (existingUser || existingTemp) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    newTemp = new tempUserModel({
      name,
      email,
      password: hashedPassword,
      verifyOtp: otp,
      verifyOtpExpiredAt: Date.now() + 5 * 60 * 1000,
    });
    await newTemp.save();

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome - Verify Your Email',
        text: `Your OTP is ${otp} (valid 5 minutes)`,
      });
    } catch (mailErr) {
      console.error('Mail send error:', mailErr);
      // If mail fails, remove temp user and return error
      if (newTemp && newTemp._id) {
        await tempUserModel.deleteOne({ _id: newTemp._id }).catch(() => {});
        newTemp = null;
      }
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    const tempToken = signToken({ email }, '5m');
    res.cookie('tempToken', tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV==='production',
      sameSite: process.env.NODE_ENV==='production' ? 'none' : 'strict',
      maxAge: 5 * 60 * 1000,
    });

    const payload = {
      success: true,
      message: 'OTP sent to your email for verification (valid for 5 minutes)',
      user: { name, email },
    };
    if (process.env.NODE_ENV !== 'production') payload.tempToken = tempToken;

    return res.status(201).json(payload);
  } catch (err) {
    console.error('Registration error:', err);
    // cleanup temp user if created
    if (newTemp && newTemp._id) {
      try {
        await tempUserModel.deleteOne({ _id: newTemp._id });
      } catch (cleanupErr) {
        console.error('Failed to cleanup temp user:', cleanupErr);
      }
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
// ...existing code...

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const tempUser = await tempUserModel.findOne({ email });
    if (!tempUser) return res.status(404).json({ success: false, message: 'No pending registration' });

    const otp = crypto.randomInt(100000, 999999).toString();
    tempUser.verifyOtp = otp;
    tempUser.verifyOtpExpiredAt = Date.now() + 5 * 60 * 1000;
    await tempUser.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Resend OTP',
      text: `Your OTP is ${otp} (valid 5 minutes)`,
    });

    const tempToken = signToken({ email }, '5m');
    res.cookie('tempToken', tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 5 * 60 * 1000,
    });

    const payload = { success: true, message: 'New OTP sent (valid 5 minutes)' };
    if (process.env.NODE_ENV !== 'production') payload.tempToken = tempToken;

    return res.status(200).json(payload);
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyRegistrationOtp = async (req, res) => {
  const { otp, email: bodyEmail } = req.body;
  const email = req.temp?.email || bodyEmail;
  if (!otp || !email) return res.status(400).json({ success: false, message: 'Missing OTP or email' });

  try {
    const tempUser = await tempUserModel.findOne({ email });
    if (!tempUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (tempUser.verifyOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (!tempUser.verifyOtpExpiredAt || tempUser.verifyOtpExpiredAt < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired' });

    const newUser = new userModel({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      isEmailVerified: true,
    });
    await newUser.save();
    await tempUserModel.deleteOne({ email });

    const token = signToken({ id: newUser._id }, '7d');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie('tempToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome',
      text: `Welcome ${newUser.name}, your account is verified.`,
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified and user registered', 
      user: { name: newUser.name, email: newUser.email } 
    });
  } catch (err) {
    console.error('verifyRegistrationOtp error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const user = await userModel.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('isAuthenticated error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyEmailChangePassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOTP = otp;
    user.resetOTPExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp} (valid 15 minutes).`,
    });

    return res.status(200).json({ success: true, message: 'Reset OTP sent to email' });
  } catch (err) {
    console.error('verifyEmailChangePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please enter all details' });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid password' });

    const token = signToken({ id: user._id }, '7d');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      user: { name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  return res.status(200).json({ success: true, message: 'User logged out' });
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isEmailVerified) return res.status(200).json({ success: true, message: 'Email already verified' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}.`,
    });

    return res.status(200).json({ success: true, message: 'Verification OTP sent to email' });
  } catch (err) {
    console.error('sendVerifyOtp error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyOtpChangePassword = async (req, res) => {
  const { otp, email: bodyEmail } = req.body;
  const userId = req.user?.id;
  if (!otp) return res.status(400).json({ success: false, message: 'Missing OTP' });

  try {
    let User;
    if (userId) {
      User = await userModel.findById(userId);
    } else if (bodyEmail) {
      User = await userModel.findOne({ email: bodyEmail });
    }

    if (!User) return res.status(404).json({ success: false, message: 'User not found' });

    if (User.resetOTP && User.resetOTP === otp) {
      if (!User.resetOTPExpiredAt || User.resetOTPExpiredAt < Date.now())
        return res.status(400).json({ success: false, message: 'Reset OTP expired' });

      User.resetOTP = '';
      User.resetOTPExpiredAt = null;
      await User.save();

      const resetToken = signToken({ id: User._id }, '15m');
      res.cookie('resetToken', resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000,
      });

      const payload = { success: true, message: 'OTP verified for password reset' };
      if (process.env.NODE_ENV !== 'production') payload.resetToken = resetToken;
      return res.status(200).json(payload);
    }

    if (User.verifyOtp && User.verifyOtp === otp) {
      if (!User.verifyOtpExpiredAt || User.verifyOtpExpiredAt < Date.now())
        return res.status(400).json({ success: false, message: 'Verify OTP expired' });

      User.isEmailVerified = true;
      User.verifyOtp = '';
      User.verifyOtpExpiredAt = null;
      await User.save();
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  } catch (err) {
    console.error('verifyOtpChangePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetNewPassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'New password is required' });

    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    else if (req.cookies && req.cookies.resetToken) token = req.cookies.resetToken;

    let User;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        User = await userModel.findById(decoded.id);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired reset token' });
      }
    } else if (email) {
      User = await userModel.findOne({ email });
    } else {
      return res.status(400).json({ success: false, message: 'No reset token or email provided' });
    }

    if (!User) return res.status(404).json({ success: false, message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    User.password = hashed;
    User.resetOTP = '';
    User.resetOTPExpiredAt = null;
    await User.save();

    res.clearCookie('resetToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('resetNewPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};