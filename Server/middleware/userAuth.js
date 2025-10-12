// middleware/userAuth.js
import jwt from 'jsonwebtoken';

export const UserAuthMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    const authHeader = req.headers?.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = { id: decoded.id };
      return next();
    } catch (err) {
      console.error('Auth verify error:', err);
      if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    console.error('UserAuthMiddleware error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyTempToken = async (req, res, next) => {
  try {
    let token = req.cookies?.tempToken;
    const authHeader = req.headers?.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    
    // Make tempToken optional for this endpoint
    if (!token) {
      req.temp = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.temp = { email: decoded.email };
      return next();
    } catch (err) {
      console.error('verifyTempToken error:', err);
      req.temp = null;
      return next();
    }
  } catch (err) {
    console.error('verifyTempToken middleware error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyResetToken = async (req, res, next) => {
  try {
    let token = req.cookies?.resetToken;
    const authHeader = req.headers?.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No reset token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = { id: decoded.id };
      return next();
    } catch (err) {
      console.error('verifyResetToken error:', err);
      if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Reset token expired' });
      return res.status(401).json({ success: false, message: 'Invalid reset token' });
    }
  } catch (err) {
    console.error('verifyResetToken middleware error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
