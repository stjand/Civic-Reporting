import jwt from 'jsonwebtoken';
import knex from '../knex.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 🟢 FIX: Find user in Supabase's `auth.users` table
    const user = await knex('auth.users')
      .where({ id: decoded.userId })
      .select('id', 'email', 'raw_user_meta_data')
      .first();

    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Attach a clean user object to the request, including metadata
    req.user = {
        id: user.id,
        email: user.email,
        ...user.raw_user_meta_data
    };
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.clearCookie('jwt');
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // 🟢 FIX: The user object now correctly contains the role from metadata
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export default authMiddleware;