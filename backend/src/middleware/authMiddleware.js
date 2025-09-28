import jwt from 'jsonwebtoken';
import knex from '../knex.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const isProduction = process.env.NODE_ENV === 'production'; // Added for clarity

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Check for JWT in the cookie
    const token = req.cookies.jwt; 
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Find user and attach to request (using userId from the updated signup/login)
    const user = await knex('users')
      .where({ id: decoded.userId }) 
      .select('id', 'name', 'email', 'role', 'department', 'designation', 'location')
      .first();

    if (!user) {
      // Clear cookie if user doesn't exist
      res.clearCookie('jwt', { 
        httpOnly: true, 
        secure: isProduction, 
        // 🟢 FIX: Use 'Lax' for local testing
        sameSite: isProduction ? 'none' : 'Lax' // <--- THIS IS THE FIX
      });
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    
    // Clear cookie on any verification failure
    res.clearCookie('jwt', { 
      httpOnly: true, 
      secure: isProduction, 
      // 🟢 FIX: Use 'Lax' for local testing
      sameSite: isProduction ? 'none' : 'Lax' // <--- THIS IS THE FIX
  });
    
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token'
    });
  }
};

export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

export default authMiddleware;