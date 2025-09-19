import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
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
    
    // Parse JSON fields
    const processedReports = allReports.map(report => ({
      ...report,
      location: typeof report.location === 'string' ? JSON.parse(report.location) : report.location,
      photos: typeof report.photos === 'string' ? JSON.parse(report.photos) : report.photos
    }));

    logger.info(`Retrieved ${processedReports.length} reports`);
    res.status(200).json({ success: true, data: processedReports, total: processedReports.length });
  } catch (error) {
    logger.error(`Failed to retrieve reports: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve reports' });
  }
});

// POST endpoint to add a new report
app.post('/api/reports', upload.single('photo'), async (req, res) => {
  try {
    const reportId = 'RPT' + Date.now();
    const { title, description, category, location, address, user_name } = req.body;

    // Parse location if it's a string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    
    const newReport = {
      report_id: reportId,
      title: title || 'Untitled Report',
      description: description || '',
      category: category || 'other',
      status: 'new',
      location: JSON.stringify(parsedLocation),
      address: address || 'Location not specified',
      user_name: user_name || 'Anonymous',
      photos: JSON.stringify(req.file ? [`/uploads/${req.file.filename}`] : []),
      priority: 'medium',
      urgency_score: 5
    };

    const [insertedReport] = await knex('reports').insert(newReport).returning('*');
    
    // Parse JSON fields for response
    const processedReport = {
      ...insertedReport,
      location: JSON.parse(insertedReport.location),
      photos: JSON.parse(insertedReport.photos)
    };

    logger.info(`Report added with ID: ${reportId}`);
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
    const report = await knex('reports').where('report_id', req.params.id).first();
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Parse JSON fields
    const processedReport = {
      ...report,
      location: typeof report.location === 'string' ? JSON.parse(report.location) : report.location,
      photos: typeof report.photos === 'string' ? JSON.parse(report.photos) : report.photos
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
      .where('report_id', reportId)
      .update({ ...updateData, updated_at: knex.fn.now() })
      .returning('*');

    if (!updatedReport) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Parse JSON fields
    const processedReport = {
      ...updatedReport,
      location: JSON.parse(updatedReport.location),
      photos: JSON.parse(updatedReport.photos)
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

    // Parse JSON fields for recent reports
    const recentReports = allReports.slice(0, 5).map(report => ({
      ...report,
      location: JSON.parse(report.location),
      photos: JSON.parse(report.photos)
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        recent_reports: recentReports
      }
    });
  } catch (error) {
    logger.error(`Failed to retrieve admin dashboard: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard data' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  logger.info('==========================================');
  logger.info('🚀 Civic Reporter Backend Started (Docker)');
  logger.info('==========================================');
  logger.info(`📡 Server running at: http://localhost:${port}`);
  logger.info(`🏥 Health check: http://localhost:${port}/api/health`);
  logger.info(`📊 Reports API: http://localhost:${port}/api/reports`);
  logger.info('==========================================');
});

export default app;
