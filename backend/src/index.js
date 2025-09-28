import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser'; // <-- NEW
import authMiddleware, { roleMiddleware } from './middleware/authMiddleware.js'; // <-- NEW
import authRoutes from './routes/authRoutes.js'; // <-- NEW

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!!fs.existsSync(uploadsDir)) {
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
    if (file.fieldname === 'photo' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for photos'), false);
    }
    if (file.fieldname === 'audio' && !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed for audio'), false);
    }
    cb(null, true);
  }
});

// --- CORRECTED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',          // Local frontend dev
  'http://127.0.0.1:5173',          // Local frontend dev alternative
  'https://civic-reporting-frontend-2hth7nqj6-stjands-projects.vercel.app', // Your Vercel frontend
  // NOTE: If you have a custom domain, add it here as well.
];

// Enable CORS with dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, mobile apps)
    if (!origin) return callback(null, true); 
    
    // Check if the requesting origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // CRITICAL: Allows sending/receiving HTTP-only cookies
}));
// --- END CORRECTED CORS CONFIGURATION ---

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser()); // <-- NEW: Use cookie parser
app.use('/uploads', express.static('uploads'));

// Logger middleware
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

// --- NEW AUTH ROUTES ---
app.use('/api/auth', authRoutes);

// DB check
const testDatabaseConnection = async () => {
  try {
    await knex.raw('SELECT 1');
    logger.info('✅ Database connection successful');
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

// Health
app.get('/health', async (req, res) => {
  try {
    await knex.raw('SELECT 1');
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), database: 'Connected', uptime: process.uptime() });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(500).json({ status: 'ERROR', database: 'Disconnected', error: error.message });
  }
});

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await knex('departments').select('*');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    logger.error(`Failed to retrieve departments: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve departments', details: error.message });
  }
});

// Reports list
app.get('/api/reports', async (req, res) => {
  try {
    const allReports = await knex('reports').select('*').orderBy('created_at', 'desc');
    const processedReports = allReports.map(report => ({
      ...report,
      location: report.latitude && report.longitude ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) } : null
    }));
    res.status(200).json({ success: true, data: processedReports, total: processedReports.length });
  } catch (error) {
    logger.error(`Failed to retrieve reports: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve reports', details: error.message });
  }
});

// Report submission (NOW PROTECTED)
app.post('/api/reports', 
  authMiddleware, // <-- NEW: Only logged-in users can submit
  upload.fields([{ name: 'photo', maxCount: 5 }, { name: 'audio', maxCount: 1 }]), 
  async (req, res) => {
  try {
    // req.user is available here from authMiddleware
    const user_id = req.user.id; // <-- NEW: Get user ID

    const { title, description, category, location, address, user_name, urgency_score, priority } = req.body;

    let parsedLocation = null;
    if (location) {
      try { parsedLocation = typeof location === 'string' ? JSON.parse(location) : location; } catch (e) { logger.error('Failed to parse location:', e); }
    }

    const imageUrls = (req.files?.photo || []).map(file => `/uploads/${file.filename}`);
    const audioUrl = req.files?.audio?.[0] ? `/uploads/${req.files.audio[0].filename}` : null;

    const categoryToDepartmentMap = {
      pothole: 'Roads & Infrastructure',
      garbage: 'Sanitation',
      streetlight: 'Electrical',
      water_leak: 'Water Supply',
      other: 'Roads & Infrastructure'
    };
    const departmentName = categoryToDepartmentMap[category] || 'Roads & Infrastructure';
    const department = await knex('departments').where({ name: departmentName }).first();
    const departmentId = department ? department.id : null;

    if (!departmentId) throw new Error(`Department not found for category: ${category}`);

    const newReport = {
      title: title || 'Untitled Report',
      description: description || '',
      category: category || 'other',
      status: 'new',
      latitude: parsedLocation ? parseFloat(parsedLocation.lat) : null,
      longitude: parsedLocation ? parseFloat(parsedLocation.lng) : null,
      address: address || 'Location not specified',
      // user_name is optional/overridable, use logged in user's name if not provided
      user_name: user_name || req.user.name, 
      urgency_score: parseInt(urgency_score) || 5,
      priority: priority || 'medium',
      image_urls: JSON.stringify(imageUrls),
      audio_url: audioUrl,
      user_id: user_id, // <-- NEW: Associate report with user
      department_id: departmentId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [insertedReport] = await knex('reports').insert(newReport).returning('*');
    res.status(201).json({ success: true, message: 'Report submitted successfully', data: insertedReport });
  } catch (error) {
    logger.error(`❌ Failed to add report: ${error.message}`);
    // If the error is from multer, the error handler below will catch it
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Failed to add report', details: error.message });
    }
  }
});

// Single report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await knex('reports').where('id', req.params.id).first();
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    logger.error(`Failed to retrieve report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve report' });
  }
});

// PATCH update
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const [updatedReport] = await knex('reports').where('id', req.params.id).update({ ...req.body, updated_at: new Date() }).returning('*');
    if (!updatedReport) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    logger.error(`Failed to update report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
});

// ✅ PUT update (fix for frontend apiClient.put)
app.put('/api/reports/:id', async (req, res) => {
  try {
    const [updatedReport] = await knex('reports').where('id', req.params.id).update({ ...req.body, updated_at: new Date() }).returning('*');
    if (!updatedReport) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    logger.error(`Failed to update report: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
});

// Admin dashboard (NOW PROTECTED)
app.get('/api/admin/dashboard', 
  authMiddleware, // <-- NEW: Requires login
  roleMiddleware(['admin']), // <-- NEW: Requires 'admin' role
  async (req, res) => {
  try {
    const allReports = await knex('reports').select('*').orderBy('created_at', 'desc');
    const stats = {
      total: allReports.length,
      new: allReports.filter(r => r.status === 'new').length,
      in_progress: allReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
      resolved: allReports.filter(r => r.status === 'resolved').length
    };
    res.status(200).json({ success: true, data: { stats, reports: allReports } });
  } catch (error) {
    logger.error(`Failed to retrieve admin dashboard: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard data' });
  }
});

// Error handler
app.use((error, req, res, next) => {
  logger.error('Express error handler:', error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
  }
  res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
});

// Start server
const startServer = async () => {
  try {
    await testDatabaseConnection();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Civic Reporter Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();

export default app;