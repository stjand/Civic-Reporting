// File: adminRoutes.js (FIXED)

import express from 'express';
import { getDashboardData } from '../controllers/adminController.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';
import knex from '../knex.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get data for the admin dashboard (stats and reports)
 * @access  Private (Requires 'admin' or 'official' role)
 */
router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware(['admin', 'official']),
  getDashboardData
);

/**
 * @route   PUT /api/admin/reports/:id
 * @desc    Updates the status, priority, and assigns the report to a specific official.
 * @access  Private (Requires 'admin' or 'official' role)
 */
router.put(
  '/reports/:id',
  authMiddleware,
  roleMiddleware(['admin', 'official']),
  async (req, res) => {
    const { id } = req.params;
    // 🟢 CHANGE: Destructuring requested updatable fields
    const { status, priority, assigned_to_user_id } = req.body; 

    if (!status) {
      return res.status(400).json({ success: false, error: 'New status is required.' });
    }

    const allowedStatuses = ['new', 'submitted', 'in_progress', 'resolved', 'rejected', 'acknowledged'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    try {
      // Use a transaction to ensure both operations succeed or fail together
      await knex.transaction(async (trx) => {
        
        // --- Step 1: Update the report status, priority, and assignment ---
        const updateFields = {
            status: status,
            ...(priority && { priority }),
            // 🟢 CHANGE: Use assigned_to_user_id (requires migration)
            assigned_to_user_id: assigned_to_user_id || null, 
            updated_at: knex.fn.now(),
        };

        const updatedReport = await trx('reports')
          .where({ report_id: id })
          .update(updateFields)
          // 🟢 CHANGE: Returning new columns
          .returning(['user_id', 'title', 'report_id', 'status', 'report_type', 'assigned_to_user_id']); 

        if (updatedReport.length === 0) {
          return res.status(404).json({ success: false, error: 'Report not found.' });
        }

        const { user_id, title, report_id, status: newStatus, report_type } = updatedReport[0];
        
        // --- Step 2: Create a notification for the reported user ---
        const notificationTitle = `Report Status Update: ${title}`;
        const notificationMessage = `The status of your report "${title}" has been updated to: ${newStatus.toUpperCase().replace('_', ' ')}.`;
        
        await trx('notifications').insert({
          user_id: user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'status_update', 
          is_read: false,
          report_id: report_id,
        });

        logger.info(`Report ID ${id} updated to status '${newStatus}', assigned to department '${report_type}', and notification sent to user ID ${user_id}`);
        res.status(200).json({ success: true, message: 'Report updated and notification sent successfully.' });
      });

    } catch (error) {
      logger.error(`Error updating status for report ID ${id}:`, error);
      res.status(500).json({ success: false, error: error.error || 'An internal server error occurred while updating the report.' });
    }
  }
);

export default router;