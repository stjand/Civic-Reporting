import express from 'express';
import { getDashboardData } from '../controllers/adminController.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get data for the admin dashboard (stats and reports)
 * @access  Private (Requires 'admin' or 'official' role)
 */
router.get(
  '/dashboard',
  authMiddleware, // First, this middleware checks if the user is logged in.
  roleMiddleware(['admin', 'official']), // Second, this checks if the user has the required role.
  getDashboardData // If both checks pass, this function is executed.
);

export default router;