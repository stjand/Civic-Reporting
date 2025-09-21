import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Shield,
  MapPin,
  Calendar,
  User,
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  X,
  Building2,
  Zap,
  Bell,
  Settings,
  LogOut,
  FileText,
  Image,
  Send,
  Home,
  Users,
  Activity,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  UserCircle,
  Eye,
  Download,
  Plus,
  Minus
} from 'lucide-react'

const ModernAdminDashboard = () => {
  const canvasRef = useRef(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports, setReports] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showSidebar, setShowSidebar] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [updateMessage, setUpdateMessage] = useState('')
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 })
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 })
  const [mapZoom, setMapZoom] = useState(12)

  // Official profile
  const officialProfile = {
    name: "Dr. Sarah Johnson",
    designation: "Municipal Administrator",
    department: "City Government",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c8b8?w=40&h=40&fit=crop&crop=face"
  }

  // Departments
  const departments = [
    { id: 'all', name: 'All Departments', icon: Building2, color: 'text-slate-600' },
    { id: 'municipal', name: 'Municipal Services', icon: Building2, color: 'text-blue-600' },
    { id: 'electrical', name: 'Electrical', icon: Zap, color: 'text-yellow-600' },
    { id: 'roads', name: 'Roads & Infrastructure', icon: Construction, color: 'text-orange-600' },
    { id: 'sanitation', name: 'Sanitation', icon: Trash2, color: 'text-green-600' },
    { id: 'water', name: 'Water & Drainage', icon: Droplets, color: 'text-cyan-600' }
  ]

  // Mock data with coordinates adjusted for better visualization
  const mockReports = [
    {
      id: 1,
      title: 'Severe pothole on Main Street',
      description: 'Large pothole causing traffic delays and vehicle damage. Located near the downtown intersection, affecting daily commuters.',
      category: 'pothole',
      department: 'roads',
      status: 'new',
      priority: 'high',
      urgency_score: 9,
      location: { lat: 12.9716, lng: 77.5946 },
      address: 'Main Street, Downtown District',
      user_name: 'John Smith',
      created_at: '2024-01-20T10:30:00Z',
      image_urls: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
      updates: []
    },
    {
      id: 2,
      title: 'Overflowing waste containers',
      description: 'Multiple garbage bins overflowing in residential area creating health hazards.',
      category: 'garbage',
      department: 'sanitation',
      status: 'in_progress',
      priority: 'medium',
      urgency_score: 6,
      location: { lat: 12.9652, lng: 77.6045 },
      address: 'Oak Avenue, Residential Area',
      user_name: 'Maria Garcia',
      created_at: '2024-01-19T14:45:00Z',
      image_urls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop'],
      updates: [
        { 
          message: 'Cleanup crew dispatched to location',
          timestamp: '2024-01-20T09:00:00Z', 
          officer: 'Sanitation Team' 
        }
      ]
    },
    {
      id: 3,
      title: 'Street light malfunction',
      description: 'Non-functional street lighting creating safety concerns for residents.',
      category: 'streetlight',
      department: 'electrical',
      status: 'resolved',
      priority: 'medium',
      urgency_score: 5,
      location: { lat: 12.9779, lng: 77.5871 },
      address: 'Pine Street, Suburb Area',
      user_name: 'David Wilson',
      created_at: '2024-01-18T20:15:00Z',
      image_urls: ['https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=400&h=300&fit=crop'],
      updates: [
        { 
          message: 'Issue resolved - new LED lights installed',
          timestamp: '2024-01-19T16:00:00Z', 
          officer: 'Electrical Department' 
        }
      ]
    },
    {
      id: 4,
      title: 'Water pipe burst emergency',
      description: 'Major pipeline burst causing flooding and traffic disruption.',
      category: 'water_leak',
      department: 'water',
      status: 'new',
      priority: 'high',
      urgency_score: 8,
      location: { lat: 12.9598, lng: 77.6097 },
      address: 'Elm Street, Commercial District',
      user_name: 'Lisa Brown',
      created_at: '2024-01-21T08:15:00Z',
      image_urls: ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop'],
      updates: []
    }
  ]

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setReports(mockReports)
      
      const newCount = mockReports.filter(r => r.status === 'new').length
      const inProgressCount = mockReports.filter(r => r.status === 'in_progress').length
      const resolvedCount = mockReports.filter(r => r.status === 'resolved').length
      
      setStats({
        total: mockReports.length,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      })
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  // Filter logic - moved to useMemo to avoid initialization issues
  const filteredReports = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return []
    
    return reports.filter(report => {
      if (!report) return false
      
      const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment
      const matchesSearch = searchTerm === '' || 
        (report.title && report.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.address && report.address.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      
      return matchesDepartment && matchesSearch && matchesStatus
    })
  }, [reports, selectedDepartment, searchTerm, statusFilter])

  // Custom map rendering
  useEffect(() => {
    if (!canvasRef.current || isLoading || !filteredReports) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    
    // Set canvas size to match display size
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    try {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw map background with grid
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw grid lines
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      
      const gridSize = 50
      for (let x = 0; x < rect.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < rect.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
      }

      // Draw streets
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 3
      
      // Main horizontal streets
      ctx.beginPath()
      ctx.moveTo(0, rect.height * 0.3)
      ctx.lineTo(rect.width, rect.height * 0.3)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, rect.height * 0.6)
      ctx.lineTo(rect.width, rect.height * 0.6)
      ctx.stroke()
      
      // Main vertical streets
      ctx.beginPath()
      ctx.moveTo(rect.width * 0.3, 0)
      ctx.lineTo(rect.width * 0.3, rect.height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(rect.width * 0.7, 0)
      ctx.lineTo(rect.width * 0.7, rect.height)
      ctx.stroke()

      // Convert lat/lng to canvas coordinates
      const latToY = (lat) => {
        const minLat = mapCenter.lat - 0.02
        const maxLat = mapCenter.lat + 0.02
        return rect.height - ((lat - minLat) / (maxLat - minLat)) * rect.height
      }
      
      const lngToX = (lng) => {
        const minLng = mapCenter.lng - 0.02
        const maxLng = mapCenter.lng + 0.02
        return ((lng - minLng) / (maxLng - minLng)) * rect.width
      }

      // Draw report markers
      filteredReports.forEach((report) => {
        if (report && report.location && typeof report.location.lat === 'number' && typeof report.location.lng === 'number') {
          const x = lngToX(report.location.lng)
          const y = latToY(report.location.lat)
          
          if (isNaN(x) || isNaN(y)) return
          
          const statusColors = {
            'new': '#ef4444',
            'in_progress': '#3b82f6',
            'resolved': '#10b981'
          }
          
          const prioritySizes = {
            'high': 12,
            'medium': 10,
            'low': 8
          }

          const radius = prioritySizes[report.priority] || 10

          // Draw marker shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.beginPath()
          ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI)
          ctx.fill()

          // Draw marker
          ctx.fillStyle = statusColors[report.status] || '#6b7280'
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
          ctx.fill()

          // Draw marker border
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw pulse effect for new reports
          if (report.status === 'new') {
            ctx.strokeStyle = statusColors[report.status]
            ctx.lineWidth = 1
            ctx.globalAlpha = 0.5
            ctx.beginPath()
            ctx.arc(x, y, radius + 5, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      })
    } catch (error) {
      console.error('Canvas rendering error:', error)
    }

  }, [filteredReports, mapCenter, mapZoom, isLoading])

  // Handle canvas click with better error handling
  const handleCanvasClick = (event) => {
    try {
      if (isLoading || !filteredReports || !Array.isArray(filteredReports)) return
      
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Convert canvas coordinates back to lat/lng
      const minLat = mapCenter.lat - 0.02
      const maxLat = mapCenter.lat + 0.02
      const minLng = mapCenter.lng - 0.02
      const maxLng = mapCenter.lng + 0.02
      
      const clickLat = maxLat - ((y / rect.height) * (maxLat - minLat))
      const clickLng = minLng + ((x / rect.width) * (maxLng - minLng))

      // Find closest report
      let closestReport = null
      let minDistance = Infinity

      filteredReports.forEach((report) => {
        if (report && report.location && 
            typeof report.location.lat === 'number' && 
            typeof report.location.lng === 'number') {
          const distance = Math.sqrt(
            Math.pow(report.location.lat - clickLat, 2) + 
            Math.pow(report.location.lng - clickLng, 2)
          )
          if (distance < minDistance && distance < 0.002) { // Within click threshold
            minDistance = distance
            closestReport = report
          }
        }
      })

      if (closestReport) {
        setSelectedReport(closestReport)
      }
    } catch (error) {
      console.error('Canvas click handler error:', error)
    }
  }

  // Filter logic
  // (removed duplicate filteredReports declaration)

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-500',
      'in_progress': 'bg-blue-500',
      'resolved': 'bg-green-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'low': 'text-green-600 bg-green-50'
    }
    return colors[priority] || 'text-gray-600 bg-gray-50'
  }

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ))
    
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Dashboard</h2>
          <p className="text-slate-600">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
        showSidebar ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        <div className="w-80 h-full flex flex-col">
          {/* Profile Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <img
                src={officialProfile.avatar}
                alt={officialProfile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-slate-900">{officialProfile.name}</h3>
                <p className="text-sm text-slate-600">{officialProfile.designation}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Reports</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.new}</div>
                <div className="text-sm text-red-600">New Issues</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-slate-200">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Departments */}
          <div className="flex-1 overflow-y-auto p-6">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Departments</h4>
            <div className="space-y-2">
              {departments.map((dept) => {
                const IconComponent = dept.icon
                const isSelected = selectedDepartment === dept.id
                const count = dept.id === 'all' 
                  ? filteredReports.length 
                  : filteredReports.filter(r => r.department === dept.id).length
                
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : dept.color}`} />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Shield className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Government Dashboard</h1>
                <p className="text-sm text-slate-600">
                  {filteredReports.length} reports • Last updated 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Map Legend */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-700">New ({stats.new})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-700">In Progress ({stats.inProgress})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-700">Resolved ({stats.resolved})</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
              Click on any marker to view details
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
            <button
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
              className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <Minus className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Custom Map Canvas */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer bg-slate-100"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedReport.title}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority?.toUpperCase()} PRIORITY
                  </span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedReport.status)}`}></div>
                  <span className="text-sm text-slate-600 capitalize">
                    {selectedReport.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Location</h3>
                  <p className="text-slate-700 text-sm">{selectedReport.address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Reported By</h3>
                  <p className="text-slate-700 text-sm">{selectedReport.user_name}</p>
                </div>
              </div>

              {selectedReport.image_urls && selectedReport.image_urls.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Evidence</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedReport.image_urls.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.updates && selectedReport.updates.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Update History</h3>
                  <div className="space-y-3">
                    {selectedReport.updates.map((update, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-slate-700 mb-2">{update.message}</p>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{update.officer}</span>
                          <span>{new Date(update.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedReport.status !== 'in_progress' && selectedReport.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'in_progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Start Working
                  </button>
                )}
                {selectedReport.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark Resolved
                  </button>
                )}
                <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                  Export Report
                </button>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Send update to citizen..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (!updateMessage.trim()) return
                    
                    const newUpdate = {
                      message: updateMessage,
                      timestamp: new Date().toISOString(),
                      officer: officialProfile.name
                    }
                    
                    setReports(prev => prev.map(report => 
                      report.id === selectedReport.id 
                        ? { ...report, updates: [...(report.updates || []), newUpdate] }
                        : report
                    ))
                    
                    setSelectedReport(prev => ({
                      ...prev,
                      updates: [...(prev.updates || []), newUpdate]
                    }))
                    
                    setUpdateMessage('')
                  }}
                  disabled={!updateMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernAdminDashboard