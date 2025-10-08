import jwt from 'jsonwebtoken';
import knex from '../knex.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey@12345678@^*^";
const isProduction = process.env.NODE_ENV === 'production';

const cookieClearOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  path: '/'
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // ✅ Verify JWT with error handling
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      res.clearCookie('jwt', cookieClearOptions);
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // ✅ Fetch user from database
    const user = await knex('auth.users')
      .where({ id: decoded.userId })
      .select('id', 'email', 'raw_user_meta_data')
      .first();

    if (!user) {
      res.clearCookie('jwt', cookieClearOptions);
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // ✅ Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.raw_user_meta_data?.role || decoded.role,
      ...user.raw_user_meta_data,
    };

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.clearCookie('jwt', cookieClearOptions);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

export const roleMiddleware = (allowedRoles = []) => (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase();
  const hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole);
  
  if (!req.user || !hasAccess) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  next();
};

export default authMiddleware;