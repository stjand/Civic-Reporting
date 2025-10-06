import express from 'express';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { supabase, BUCKET_NAME } from '../utils/supabase.js';

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadMiddleware = upload.fields([
  { name: 'photos', maxCount: 3 },
  { name: 'audio', maxCount: 1 },
]);

// Helper: Upload file to Supabase
const uploadFileToSupabase = async (file) => {
  const ext = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
};

// Auto-assign priority
const determinePriority = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  const highKeywords = ['emergency', 'urgent', 'danger', 'fire', 'leak', 'collapse', 'flooding', 'major'];
  const mediumKeywords = ['large', 'broken', 'hazard', 'safety', 'exposed', 'deep', 'burst', 'damaged'];

  if (highKeywords.some(k => content.includes(k))) return 'high';
  if (mediumKeywords.some(k => content.includes(k))) return 'medium';
  return 'low';
};

// Submit a new report
router.post('/', authMiddleware, roleMiddleware(['citizen']), uploadMiddleware, async (req, res) => {
  try {
    const { title, description, report_type, latitude, longitude, address } = req.body;

    // Upload files to Supabase
    const photo_url = req.files.photos ? await uploadFileToSupabase(req.files.photos[0]) : null;
    const audio_url = req.files.audio ? await uploadFileToSupabase(req.files.audio[0]) : null;

    const priority = determinePriority(title, description);

    const reportData = {
      user_id: req.user.id,
      title,
      report_type,
      description,
      latitude,
      longitude,
      address,
      photo_url,
      audio_url,
      status: 'new',
      priority,
    };

    const [newReport] = await knex('reports').insert(reportData).returning('*');
    res.status(201).json({ success: true, report: newReport });
  } catch (error) {
    logger.error(`Report submission failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user's reports
router.get('/my-reports', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error(`Failed to get user reports: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user statistics
router.get('/my-stats', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .where({ user_id: req.user.id })
      .select('status');

    const stats = {
      reportsSubmitted: reports.length,
      reportsResolved: reports.filter(r => r.status === 'resolved').length,
      reportsInProgress: reports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
      reportsNew: reports.filter(r => r.status === 'new').length,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    logger.error(`Failed to get user stats: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get report details
router.get('/:reportId', authMiddleware, async (req, res) => {
  try {
    const report = await knex('reports')
      .where({ report_id: req.params.reportId })
      .first();

    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    logger.error(`Failed to get report details: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reports for validation
router.get('/validate/pending', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .whereNot({ user_id: req.user.id })
      .where({ status: 'new' })
      .orderBy('created_at', 'asc')
      .limit(10);

    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error(`Failed to get validation reports: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
