import jwt from 'jsonwebtoken';

export const UserAuthMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    if (!process.env.JWT_SECRET_KEY) {
      console.error('JWT_SECRET_KEY is not defined');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = { id: decodedToken.id }; // Set req.user instead of req.body
    next();
  }
   catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    return res.status(500)
              .json({ success: false, message: 'Server error' });
  }
};