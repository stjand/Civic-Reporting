import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe 
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // Logout can be public to ensure cookie is cleared

// Protected route to get logged-in user details
router.get('/me', authMiddleware, getMe);

export default router;