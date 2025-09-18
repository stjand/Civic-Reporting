import { Router } from 'express'
import path from 'path' // Import the path module

export default (upload) => {
  const router = Router()

  // Sample data storage (in real app, this would be database)
  let reports = [
    {
      id: 1,
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing vehicle damage near traffic light',
      category: 'pothole',
      status: 'new',
      location: { lat: 12.9716, lng: 77.5946 },
      address: 'Main Street, near City Center',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      user_name: 'John Citizen',
      photos: [],
      priority: 'low',
      urgency_score: 5
    },
    {
      id: 2,
      title: 'Garbage pile on Park Road',
      description: 'Large garbage accumulation blocking pedestrian path',
      category: 'garbage',
      status: 'in_progress',
      location: { lat: 12.9726, lng: 77.5956 },
      address: 'Park Road, Block A',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      user_name: 'Jane Smith',
      photos: [],
      priority: 'medium',
      urgency_score: 7
    }
  ]

  let users = [
    { phone: '9876543210', role: 'admin', verified: true }
  ]

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  })

  // API info
  router.get('/', (req, res) => {
    res.json({
      name: 'Civic Reporter API',
      version: '0.1.0',
      status: 'running'
    })
  })

  // Reports endpoints
  router.get('/reports', (req, res) => {
    res.json({
      success: true,
      data: reports,
      total: reports.length
    })
  })

  // Add the multer middleware directly to the route
  router.post('/reports', upload.single('photo'), (req, res) => {
    try {
      const { title, description, category, location, address, user_name } = req.body

      // Ensure location is parsed correctly from the string
      const parsedLocation = location ? JSON.parse(location) : null;

      const newReport = {
        id: Date.now(),
        title,
        description,
        category,
        location: parsedLocation,
        address,
        user_name: user_name || 'Anonymous',
        status: 'new',
        created_at: new Date().toISOString(),
        photos: req.file ? [`/uploads/${req.file.filename}`] : [], // Store the file path
        priority: 'low', // Added a default value
        urgency_score: 5, // Added a default value
      }

      reports.push(newReport)

      res.status(201).json({
        success: true,
        data: newReport,
        message: 'Report created successfully'
      })
    } catch (error) {
      console.error('Failed to create report:', error)
      res.status(400).json({
        success: false,
        error: 'Failed to create report'
      })
    }
  })

  router.get('/reports/:id', (req, res) => {
    const report = reports.find(r => r.id === parseInt(req.params.id))

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    res.json({ success: true, data: report })
  })

  router.put('/reports/:id/status', (req, res) => {
    const report = reports.find(r => r.id === parseInt(req.params.id))

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    report.status = req.body.status
    report.updated_at = new Date().toISOString()

    res.json({
      success: true,
      data: report,
      message: 'Status updated successfully'
    })
  })

  // Admin dashboard
  router.get('/admin/dashboard', (req, res) => {
    const stats = {
      total: reports.length,
      new: reports.filter(r => r.status === 'new').length,
      in_progress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length
    }

    res.json({
      success: true,
      data: {
        reports,
        stats,
        recent_reports: reports.slice(-5).reverse()
      }
    })
  })

  // Auth endpoints
  router.post('/auth/otp/request', (req, res) => {
    const { phone } = req.body

    // Simulate OTP sending
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: '123456' // In production, don't send OTP in response
    })
  })

  router.post('/auth/otp/verify', (req, res) => {
    const { phone, otp } = req.body

    if (otp === '123456') {
      const user = users.find(u => u.phone === phone) || { phone, role: 'user', verified: true }

      res.json({
        success: true,
        message: 'Login successful',
        user,
        token: 'sample-jwt-token'
      })
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid OTP'
      })
    }
  })

  return router
}