import jwt from 'jsonwebtoken';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import 'dotenv/config'; // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Check for JWT in the cookie
    const token = req.cookies.jwt; 
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication failed: No token provided' 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Find user and attach to request
    const user = await knex('users').where({ id: decoded.userId }).select('id', 'name', 'email', 'role').first();

    if (!user) {
      // Clear cookie if token is invalid but present
      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication failed: User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    // Clear cookie on verification failure (e.g., expired token)
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication failed: Invalid token',
      details: error.message
    });
  }
};

export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Authorization failed: Access denied' 
      });
    }
    next();
  };
};

export default authMiddleware;