// File: routes/NotificationRoutes.js

import express from 'express';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications/me
 * @desc    Get all notifications for the authenticated user.
 * @access  Private (Requires 'citizen' role)
 */
router.get('/me', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const notifications = await knex('notifications')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc')
      .limit(50); // Limit results for performance

    res.status(200).json({ success: true, notifications });

  } catch (error) {
    logger.error(`Failed to get user notifications: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve notifications' });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a specific notification as read.
 * @access  Private (Requires 'citizen' role)
 */
router.put('/:id/read', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await knex('notifications')
      .where({ id: id, user_id: req.user.id }) // Ensure user only updates their own
      .update({ is_read: true, sent_at: knex.fn.now() }) // Use sent_at for "read time"
      .returning('*');

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notification not found or access denied.' });
    }

    res.status(200).json({ success: true, notification: updated });

  } catch (error) {
    logger.error(`Failed to mark notification ${req.params.id} as read: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update notification status' });
  }
});

export default router;