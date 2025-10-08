import express from 'express';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { supabase, BUCKET_NAME } from '../utils/supabase.js';

const router = express.Router();

// -------------------- Multer setup --------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const uploadMiddleware = upload.fields([
  { name: 'photos', maxCount: 3 },
  { name: 'audio', maxCount: 1 },
]);

// -------------------- Helper functions --------------------
const uploadFileToSupabase = async (file, accessToken) => {
  try {
    const ext = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Use user access token to satisfy RLS
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
        options: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return publicData.publicUrl;
  } catch (error) {
    logger.error(`Upload failed: ${error.message}`);
    throw error;
  }
};

const determinePriority = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  if (/emergency|urgent|danger|fire|collapse/i.test(content)) return 'high';
  if (/large|broken|hazard|safety/i.test(content)) return 'medium';
  return 'low';
};

// -------------------- Routes --------------------

// POST /api/reports - submit report
router.post('/', authMiddleware, roleMiddleware(['citizen']), uploadMiddleware, async (req, res) => {
  try {
    const { title, description, report_type, latitude, longitude, address } = req.body;

    if (!title || !description || !report_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Extract user JWT from headers
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'Missing auth token' });
    }

    // Upload files in parallel
    const uploads = [];
    if (req.files?.photos?.[0]) uploads.push(uploadFileToSupabase(req.files.photos[0], accessToken));
    if (req.files?.audio?.[0]) uploads.push(uploadFileToSupabase(req.files.audio[0], accessToken));

    const [photo_url, audio_url] = await Promise.all(uploads);

    const reportData = {
      user_id: req.user.id, // UUID, matches Supabase auth.uid()
      title: title.trim(),
      report_type,
      description: description.trim(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address: address || null,
      photo_url: photo_url || null,
      audio_url: audio_url || null,
      status: 'new',
      priority: determinePriority(title, description),
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newReport] = await knex('reports').insert(reportData).returning('*');
    res.status(201).json({ success: true, report: newReport });

  } catch (error) {
    logger.error(`Report submission failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
});

// GET /api/reports/my-reports - list user's reports
router.get('/my-reports', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .where({ user_id: req.user.id })
      .select('report_id', 'title', 'status', 'priority', 'created_at', 'report_type')
      .orderBy('created_at', 'desc')
      .limit(100);

    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error(`Failed to get reports: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/my-stats - summary stats
router.get('/my-stats', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const result = await knex('reports')
      .where({ user_id: req.user.id })
      .select(
        knex.raw('COUNT(*) as "reportsSubmitted"'),
        knex.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as "reportsResolved"', ['resolved']),
        knex.raw('SUM(CASE WHEN status IN (?, ?) THEN 1 ELSE 0 END) as "reportsInProgress"', ['acknowledged', 'in_progress']),
        knex.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as "reportsNew"', ['new'])
      )
      .first();

    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    logger.error(`Failed to get stats: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// GET /api/reports/:reportId - fetch single report
router.get('/:reportId', authMiddleware, async (req, res) => {
  try {
    const report = await knex('reports')
      .where({ report_id: req.params.reportId })
      .first();

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    logger.error(`Failed to get report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch report' });
  }
});

export default router;
