import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import authMiddleware, { roleMiddleware } from './middleware/authMiddleware.js';

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/ReportRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- CORS CONFIGURATION (Crucial for Frontend Communication) ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://civic-reporting-frontend-4vkpnoniy-stjands-projects.vercel.app'
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// --- CORE MIDDLEWARE ---
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((error, req, res, next) => {
  logger.error('Global Express Error Handler:', error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
  }
  res.status(500).json({ success: false, error: 'An internal server error occurred', details: error.message });
});

// --- SERVER STARTUP ---
const startServer = async () => {
  try {
    await knex.raw('select 1+1 as result');
    logger.info('✅ Database connection successful.');
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Database connection failed. Server will not start.');
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();