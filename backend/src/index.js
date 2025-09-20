import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Enable CORS for all routes and origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Civic Reporting backend with Database!');
});

// GET endpoint for health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await knex.raw('SELECT 1');
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// GET endpoint to retrieve all reports
app.get('/api/reports', async (req, res) => {
  try {
    const allReports = await knex('reports').select('*').orderBy('created_at', 'desc');
    
    const processedReports = allReports.map(report => ({
      ...report,
      location: report.location ? { lat: report.location.y, lng: report.location.x } : null,
      image_urls: report.image_urls || [],
      audio_url: report.audio_url || null
    }));

    logger.info(`Retrieved ${processedReports.length} reports`);
    res.status(200).json({ success: true, data: processedReports, total: processedReports.length });
  } catch (error) {
    logger.error(`Failed to retrieve reports: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve reports' });
  }
});

// POST endpoint to add a new report
app.post('/api/reports', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, category, location, address, user_name } = req.body;
    
    // Parse location
    const parsedLocation = location ? JSON.parse(location) : null;
    const photoFile = req.files?.photo?.[0];
    const audioFile = req.files?.audio?.[0];
    
    const newReport = {
      title: title || 'Untitled Report',
      description: description || '',
      category: category || 'other',
      status: 'new',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(${parsedLocation.lng}, ${parsedLocation.lat}), 4326)`),
      address: address || 'Location not specified',
      user_name: user_name || 'Anonymous',
      image_urls: photoFile ? [`/uploads/${photoFile.filename}`] : [],
      audio_url: audioFile ? `/uploads/${audioFile.filename}` : null,
      priority: 'medium',
      urgency_score: 5,
      // Placeholder for foreign keys since frontend doesn't provide them yet
      user_id: 1, // Assume a default user
      department_id: 1 // Assume a default department
    };

    const [insertedReport] = await knex('reports').insert(newReport).returning('*');
    
    const processedReport = {
      ...insertedReport,
      location: insertedReport.location ? { lat: insertedReport.location.y, lng: insertedReport.location.x } : null,
      image_urls: insertedReport.image_urls || [],
      audio_url: insertedReport.audio_url || null
    };

    logger.info(`Report added with ID: ${processedReport.id}`);
    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      data: processedReport
    });
  } catch (error) {
    logger.error(`Failed to add report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to add report' });
  }
});

// GET endpoint to retrieve a specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await knex('reports').where('id', req.params.id).first();
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const processedReport = {
      ...report,
      location: report.location ? { lat: report.location.y, lng: report.location.x } : null,
      image_urls: report.image_urls || [],
      audio_url: report.audio_url || null
    };

    res.status(200).json({ success: true, data: processedReport });
  } catch (error) {
    logger.error(`Failed to retrieve report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve report' });
  }
});

// PATCH endpoint to update report status
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const updateData = req.body;

    const [updatedReport] = await knex('reports')
      .where('id', reportId)
      .update({ ...updateData, updated_at: knex.fn.now() })
      .returning('*');

    if (!updatedReport) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const processedReport = {
      ...updatedReport,
      location: updatedReport.location ? { lat: updatedReport.location.y, lng: updatedReport.location.x } : null,
      image_urls: updatedReport.image_urls || [],
      audio_url: updatedReport.audio_url || null
    };

    res.status(200).json({ success: true, data: processedReport });
  } catch (error) {
    logger.error(`Failed to update report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
});

// Admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const allReports = await knex('reports').select('*').orderBy('created_at', 'desc');
    
    const stats = {
      total: allReports.length,
      new: allReports.filter(r => r.status === 'new').length,
      in_progress: allReports.filter(r => r.status === 'in_progress').length,
      resolved: allReports.filter(r => r.status === 'resolved').length
    };

    const processedReports = allReports.map(report => ({
      ...report,
      location: report.location ? { lat: report.location.y, lng: report.location.x } : null,
      image_urls: report.image_urls || [],
      audio_url: report.audio_url || null
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        reports: processedReports
      }
    });
  } catch (error) {
    logger.error(`Failed to retrieve admin dashboard: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard data' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('==========================================');
  logger.info('🚀 Civic Reporter Backend Started');
  logger.info('==========================================');
  logger.info(`📡 Server running at: http://localhost:${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📊 Reports API: http://localhost:${PORT}/api/reports`);
  logger.info('==========================================');
});

export default app;