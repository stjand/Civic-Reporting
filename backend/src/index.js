import express from 'express';
import cors from 'cors';
import knex from './knex.js';
import logger from './utils/logger.js';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Middleware & Routes
import authMiddleware, { roleMiddleware } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/ReportRoutes.js';
import notificationRoutes from './routes/NotificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://civic-reporting-frontend.vercel.app',
  'https://civic-reporting-frontend-4vkpnoniy-stjands-projects.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Reverse Geocoding
app.get('/api/geocode/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, error: 'Latitude and longitude required' });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'Civic-Reporting-App/1.0 (contact@example.com)' },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    res.json({ success: true, address: data.display_name, data });
  } catch (error) {
    logger.error('Geocoding error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Global error:', err);
  res.status(500).json({ success: false, error: err.message });
});

// Start Server
const startServer = async () => {
  try {
    console.log('Attempting database connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL exists:', !!process.env.DATABASE_URL);
    
    const result = await knex.raw('SELECT 1+1 AS result');
    logger.info('✅ Database connected successfully', result);
    
    app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    logger.error('❌ Database connection failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1); // Exit instead of continuing without DB
  }
};

startServer();
