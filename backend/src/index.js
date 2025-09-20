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
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and audio files
    if (file.fieldname === 'photo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for photos'), false);
      }
    } else if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Enable CORS for all routes and origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    await knex.raw('SELECT 1');
    logger.info('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await knex.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    logger.info(`📊 Found ${tables.rows.length} tables in database`);
    
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Civic Reporting Backend API',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      reports: '/api/reports',
      admin: '/api/admin/dashboard'
    }
  });
});

// GET endpoint for health check
app.get('/health', async (req, res) => {
  try {
    await knex.raw('SELECT 1');
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      uptime: process.uptime()
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

// New GET endpoint to retrieve all departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await knex('departments').select('*');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    logger.error(`Failed to retrieve departments: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve departments',
      details: error.message 
    });
  }
});

// GET endpoint to retrieve all reports
app.get('/api/reports', async (req, res) => {
  try {
    const allReports = await knex('reports')
      .select('*')
      .orderBy('created_at', 'desc');
    
    const processedReports = allReports.map(report => ({
      ...report,
      location: report.latitude && report.longitude 
        ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) } 
        : null,
      image_urls: report.image_urls,
      audio_url: report.audio_url || null
    }));

    logger.info(`Retrieved ${processedReports.length} reports`);
    res.status(200).json({ 
      success: true, 
      data: processedReports, 
      total: processedReports.length 
    });
  } catch (error) {
    logger.error(`Failed to retrieve reports: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve reports',
      details: error.message 
    });
  }
});

// POST endpoint to add a new report
app.post('/api/reports', upload.fields([{ name: 'photo', maxCount: 5 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    logger.info('📝 Processing new report submission...');
    logger.info('Request body:', req.body);
    logger.info('Files received:', req.files);

    const { title, description, category, location, address, user_name, urgency_score, priority } = req.body;
    
    // Parse location
    let parsedLocation = null;
    if (location) {
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        logger.error('Failed to parse location:', e);
      }
    }

    // Handle file uploads
    const photoFiles = req.files?.photo || [];
    const audioFile = req.files?.audio?.[0];

    // Create URLs for uploaded files
    const imageUrls = photoFiles.map(file => `/uploads/${file.filename}`);
    const audioUrl = audioFile ? `/uploads/${audioFile.filename}` : null;

    // Dynamically get the correct department ID based on category
    const categoryToDepartmentMap = {
      pothole: 'Roads & Infrastructure',
      garbage: 'Sanitation',
      streetlight: 'Electrical',
      water_leak: 'Water Supply',
      other: 'Roads & Infrastructure' // Default department
    };

    const departmentName = categoryToDepartmentMap[category] || 'Roads & Infrastructure';
    const department = await knex('departments').where({ name: departmentName }).first();
    const departmentId = department ? department.id : null;

    if (!departmentId) {
      throw new Error(`Department not found for category: ${category}`);
    }

    const newReport = {
      title: title || 'Untitled Report',
      description: description || '',
      category: category || 'other',
      status: 'new',
      latitude: parsedLocation ? parseFloat(parsedLocation.lat) : null,
      longitude: parsedLocation ? parseFloat(parsedLocation.lng) : null,
      address: address || 'Location not specified',
      user_name: user_name || 'Anonymous',
      urgency_score: parseInt(urgency_score) || 5,
      priority: priority || 'medium',
      image_urls: imageUrls,
      audio_url: audioUrl,
      user_id: null,
      department_id: departmentId, 
      created_at: new Date(),
      updated_at: new Date()
    };

    logger.info('📊 Inserting report into database:', newReport);

    const [insertedReport] = await knex('reports')
      .insert(newReport)
      .returning('*');
    
    const processedReport = {
      ...insertedReport,
      location: insertedReport.latitude && insertedReport.longitude 
        ? { lat: parseFloat(insertedReport.latitude), lng: parseFloat(insertedReport.longitude) } 
        : null,
      image_urls: insertedReport.image_urls,
      audio_url: insertedReport.audio_url || null
    };

    logger.info(`✅ Report added successfully with ID: ${processedReport.id}`);
    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      data: processedReport
    });

  } catch (error) {
    logger.error(`❌ Failed to add report: ${error.message}`);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add report',
      details: error.message 
    });
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
      location: report.latitude && report.longitude 
        ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) } 
        : null,
      image_urls: report.image_urls,
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

    logger.info(`📝 Updating report ${reportId} with data:`, updateData);

    const [updatedReport] = await knex('reports')
      .where('id', reportId)
      .update({ ...updateData, updated_at: new Date() })
      .returning('*');

    if (!updatedReport) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const processedReport = {
      ...updatedReport,
      location: updatedReport.latitude && updatedReport.longitude 
        ? { lat: parseFloat(updatedReport.latitude), lng: parseFloat(updatedReport.longitude) } 
        : null,
      image_urls: updatedReport.image_urls,
      audio_url: updatedReport.audio_url || null
    };

    logger.info(`✅ Report ${reportId} updated successfully`);
    res.status(200).json({ success: true, data: processedReport });
  } catch (error) {
    logger.error(`Failed to update report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
});

// Admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const allReports = await knex('reports')
      .select('*')
      .orderBy('created_at', 'desc');
    
    const stats = {
      total: allReports.length,
      new: allReports.filter(r => r.status === 'new').length,
      in_progress: allReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
      resolved: allReports.filter(r => r.status === 'resolved').length
    };

    const processedReports = allReports.map(report => ({
      ...report,
      location: report.latitude && report.longitude 
        ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) } 
        : null,
      image_urls: report.image_urls,
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

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Express error handler:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// Start server
const startServer = async () => {
  try {
    await testDatabaseConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('==========================================');
      logger.info('🚀 Civic Reporter Backend Started');
      logger.info('==========================================');
      logger.info(`📡 Server running at: http://localhost:${PORT}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Reports API: http://localhost:${PORT}/api/reports`);
      logger.info('==========================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;