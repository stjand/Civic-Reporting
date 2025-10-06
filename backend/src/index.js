// File: src/index.js

import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// --- Middleware imports ---
import authMiddleware, { roleMiddleware } from './middleware/authMiddleware.js';

// --- Route imports ---
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/ReportRoutes.js';
import notificationRoutes from './routes/NotificationRoutes.js';

// --- Load environment variables ---
dotenv.config();

// --- Express app setup ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- Ensure uploads directory exists ---
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://civic-reporting-frontend.vercel.app',
  'https://civic-reporting-frontend-4vkpnoniy-stjands-projects.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true, // Allows cookies / Authorization headers
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

// --- Core Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

// --- Reverse Geocoding Proxy Endpoint (Nominatim) ---
app.get('/api/geocode/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ success: false, error: 'Latitude and longitude are required.' });
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Civic-Reporting-App/1.0 (contact@example.com)',
      },
    });

    if (!response.ok) {
      logger.error(`Nominatim API Error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `External geocoding failed: ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.json({ success: true, address: data.display_name, data });
  } catch (error) {
    logger.error('Proxy fetch failed:', error.message);
    res.status(500).json({ success: false, error: 'Failed to reach external geocoding service.' });
  }
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Global Error Handler ---
app.use((error, req, res, next) => {
  logger.error('Global Express Error Handler:', error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
  }
  res.status(500).json({ success: false, error: 'An internal server error occurred', details: error.message });
});

// --- Server Startup ---
const startServer = async () => {
  try {
    // Test database connection
    await knex.raw('SELECT 1+1 AS result');
    logger.info('✅ Database connection successful.');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
    });
  } catch (error) {
    logger.error('❌ Database connection failed. Server will not start.');
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();
