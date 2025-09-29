import knex from '../knex.js';
import logger from '../utils/logger.js';

/**
 * Fetches statistics and a list of all reports for the admin dashboard.
 * This is the sole function of this controller.
 */
export const getDashboardData = async (req, res) => {
  try {
    // Fetch all reports from the database, ordered by the newest first
    const allReports = await knex('reports')
      .select('*')
      .orderBy('created_at', 'desc');

    // Calculate statistics based on the status of the reports
    const stats = {
      total: allReports.length,
      new: allReports.filter(r => r.status === 'new').length,
      in_progress: allReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
      resolved: allReports.filter(r => r.status === 'resolved').length,
    };

    // Send a successful response containing both stats and the full list of reports
    res.status(200).json({
      success: true,
      data: {
        stats,
        reports: allReports
      }
    });

  } catch (error) {
    // Log any errors that occur during the process
    logger.error(`Failed to retrieve admin dashboard data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
};