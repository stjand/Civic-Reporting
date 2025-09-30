// File: ReportRoutes.js (CLEANED OF JSX/FRONTEND COMPONENTS)

import express from 'express';
import knex from '../knex.js';
import logger from '../utils/logger.js';
import authMiddleware, { roleMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png/;
    const allowedAudioTypes = /mp3|mpeg|wav|ogg|m4a|aac|webm/; 
    const extname = path.extname(file.originalname).toLowerCase();
    
    if (file.fieldname === 'photos') { // Note: Changed to 'photos' to match array upload in frontend
        const isImage = allowedImageTypes.test(file.mimetype) && allowedImageTypes.test(extname);
        if (isImage) return cb(null, true);
        
        cb(new Error('Only JPEG, JPG, or PNG image files are allowed for photo upload.'));
        
    } else if (file.fieldname === 'audio') {
        const isAudio = allowedAudioTypes.test(file.mimetype) || allowedAudioTypes.test(extname);
        if (isAudio) return cb(null, true);

        cb(new Error('Only MP3, WAV, OGG, M4A, AAC, or WEBM audio files are allowed for audio upload.'));
        
    } else {
        cb(null, false); 
    }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter 
});

// Use fields() to handle multiple, optional fields (Frontend sends 'photos' array and optional 'audio')
const uploadMiddleware = upload.fields([
    { name: 'photos', maxCount: 3 }, // Handles array of up to 3 photos
    { name: 'audio', maxCount: 1 } 
]);

// NEW FUNCTION: Auto-assign priority based on content
const determinePriority = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  
  const highKeywords = ['emergency', 'urgent', 'danger', 'fire', 'leak', 'collapse', 'flooding', 'major'];
  if (highKeywords.some(keyword => content.includes(keyword))) {
    return 'high';
  }

  const mediumKeywords = ['large', 'broken', 'hazard', 'safety', 'exposed', 'deep', 'burst', 'damaged'];
  if (mediumKeywords.some(keyword => content.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

// Submit a new report
router.post('/', authMiddleware, roleMiddleware(['citizen']), uploadMiddleware, async (req, res) => {
  try {
    const { title, description, report_type, latitude, longitude, address } = req.body;
    
    // Safely extract file URLs (Handle multiple photos by taking the first one for simplicity, or storing an array/JSON in a real app)
    const photo_url = req.files && req.files.photos && req.files.photos.length > 0 ? `/uploads/${req.files.photos[0].filename}` : null;
    const audio_url = req.files && req.files.audio ? `/uploads/${req.files.audio[0].filename}` : null;
    
    // Automatic priority assignment
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
      priority: priority, 
    };
    
    const [newReport] = await knex('reports').insert(reportData).returning('*');
    
    res.status(201).json({ success: true, report: newReport });
  } catch (error) {
    logger.error(`Report submission failed: ${error.message}`);
    
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: `File upload failed: ${error.message}` });
    }
    
    if (error.message.includes('files are allowed')) {
        return res.status(400).json({ success: false, error: error.message });
    }
    
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
});

// Get current user's reports (unchanged)
router.get('/my-reports', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    
    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error(`Failed to get user reports: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve reports' });
  }
});

// Get user statistics (unchanged)
router.get('/my-stats', authMiddleware, roleMiddleware(['citizen']), async (req, res) => {
  try {
    const reports = await knex('reports')
      .where({ user_id: req.user.id })
      .select('status');
    
    const stats = {
      reportsSubmitted: reports.length,
      reportsResolved: reports.filter(r => r.status === 'resolved').length,
      reportsInProgress: reports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
      reportsNew: reports.filter(r => r.status === 'new').length
    };
    
    res.status(200).json({ success: true, stats });
  } catch (error) {
    logger.error(`Failed to get user stats: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve statistics' });
  }
});

// Get report details by ID (unchanged)
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
    logger.error(`Failed to get report details: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve report details' });
  }
});

// Get reports for validation (exclude user's own reports) (unchanged)
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
    res.status(500).json({ success: false, error: 'Failed to retrieve reports' });
  }
});

export default router;