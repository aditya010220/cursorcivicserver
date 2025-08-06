import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to authenticate user and attach user info to request
export const authMiddleware = async (req, res, next) => {
  try {
    // Log headers for debugging
    // console.log('Request Headers:', req.headers);
    
    // Try to get token from different sources
    let token;
    
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Check cookies if no Authorization header
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // If no token found in any location
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user from token data
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Attach user info to the request
    req.user = user;
    req.userId = user._id.toString();
    req.userEmail = user.email;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// Middleware to check if user is admin
export const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const creatorMiddleware = (req, res, next) => {
  if (req.userRole !== 'campaign_creator' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Creator access required' });
  }
  next();
};