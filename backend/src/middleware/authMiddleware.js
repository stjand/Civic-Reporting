import jwt from 'jsonwebtoken';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey@12345678@^*^";
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Supabase admin client for secure auth schema access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cookieClearOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  path: '/'
};

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Cookie or Authorization header
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (req.cookies?.jwt) res.clearCookie('jwt', cookieClearOptions);
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // 3. Fetch user via Supabase Admin API (avoiding direct auth.users query)
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(decoded.userId);

    if (userError || !user) {
      logger.error(`User fetch error: ${userError?.message || 'User not found'}`);
      if (req.cookies?.jwt) res.clearCookie('jwt', cookieClearOptions);
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // 4. Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || decoded.role || 'citizen',
      ...user.user_metadata,
    };

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
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