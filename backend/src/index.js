// File: backend/src/index.js (SIMPLIFIED)
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import logger from './utils/logger.js' // Corrected import path
import routes from './routes/index.js'
import multer from 'multer'
import fs from 'fs' // Import the 'fs' module
import path from 'path' // Import the 'path' module

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Create the 'uploads' directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage: storage })

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Note: Multer will handle multipart/form-data. The express.json and urlencoded are for other content types.
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Root health check (outside /api)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Civic Reporter API is running!'
  })
})

// API routes
// The upload middleware is passed to the routes handler
app.use('/api', routes(upload))

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/',
      'GET /api/health',
      'GET /api/reports',
      'POST /api/reports'
    ]
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server Error:', err.stack)
  res.status(500).json({
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  })
})

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`🌐 Access your API at: http://localhost:${PORT}`)
  logger.info(`💊 Health check: http://localhost:${PORT}/health`)
})

export default app