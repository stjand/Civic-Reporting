import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Crown,
  Download,
  MapPin,
  Calendar,
  User,
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Mic,
  Play,
  Pause,
  Volume2,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Shield,
  Truck,
  Zap,
  TreePine,
  MessageSquare,
  Eye,
  Settings,
  LogOut,
  Bell,
  FileText,
  Image,
  Send
} from 'lucide-react'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const AdminDashboard = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports, setReports] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [updateMessage, setUpdateMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Mock departments data
  const departments = [
    { id: 'all', name: 'All Departments', icon: Building2, color: 'bg-blue-600', count: 247 },
    { id: 'roads', name: 'Public Works', icon: Construction, color: 'bg-orange-600', count: 89 },
    { id: 'sanitation', name: 'Sanitation', icon: Trash2, color: 'bg-green-600', count: 64 },
    { id: 'utilities', name: 'Utilities', icon: Zap, color: 'bg-yellow-600', count: 45 },
    { id: 'transport', name: 'Transportation', icon: Truck, color: 'bg-purple-600', count: 32 },
    { id: 'environment', name: 'Environment', icon: TreePine, color: 'bg-teal-600', count: 17 }
  ]

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      title: 'Large pothole on MG Road',
      description: 'Deep pothole causing vehicle damage near the traffic signal intersection. Multiple vehicles have been damaged.',
      category: 'pothole',
      department: 'roads',
      status: 'new',
      priority: 'high',
      urgency_score: 8,
      location: { lat: 12.9716, lng: 77.5946 },
      address: 'MG Road, Bengaluru, Karnataka',
      user_name: 'Rajesh Kumar',
      created_at: '2024-01-20T10:30:00Z',
      image_urls: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400'],
      audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      updates: []
    },
    {
      id: 2,
      title: 'Overflowing garbage bins',
      description: 'Multiple garbage bins overflowing for the past 3 days. Creating hygiene issues.',
      category: 'garbage',
      department: 'sanitation',
      status: 'in_progress',
      priority: 'medium',
      urgency_score: 6,
      location: { lat: 12.9352, lng: 77.6245 },
      address: 'Brigade Road, Bengaluru, Karnataka',
      user_name: 'Priya Sharma',
      created_at: '2024-01-19T14:45:00Z',
      image_urls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400'],
      updates: [
        { message: 'Team dispatched to location', timestamp: '2024-01-20T09:00:00Z', officer: 'Municipal Officer' }
      ]
    },
    {
      id: 3,
      title: 'Street light not working',
      description: 'Street light has been non-functional for over a week, creating safety concerns.',
      category: 'streetlight',
      department: 'utilities',
      status: 'acknowledged',
      priority: 'low',
      urgency_score: 4,
      location: { lat: 12.9279, lng: 77.6271 },
      address: 'Koramangala 5th Block, Bengaluru, Karnataka',
      user_name: 'Amit Patel',
      created_at: '2024-01-18T20:15:00Z',
      image_urls: ['https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=400'],
      updates: []
    },
    {
      id: 4,
      title: 'Water pipe burst',
      description: 'Major water pipe burst causing road flooding and water wastage.',
      category: 'water_leak',
      department: 'utilities',
      status: 'resolved',
      priority: 'high',
      urgency_score: 9,
      location: { lat: 12.9698, lng: 77.7500 },
      address: 'Whitefield Main Road, Bengaluru, Karnataka',
      user_name: 'Sunita Reddy',
      created_at: '2024-01-17T08:30:00Z',
      image_urls: ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400'],
      updates: [
        { message: 'Emergency team dispatched', timestamp: '2024-01-17T09:00:00Z', officer: 'Water Department' },
        { message: 'Repair completed successfully', timestamp: '2024-01-17T15:30:00Z', officer: 'Water Department' }
      ]
    }
  ]

  useEffect(() => {
    setReports(mockReports)
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([12.9716, 77.5946], 12)

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)

      // Add custom attribution
      L.control.attribution({
        position: 'bottomleft',
        prefix: false
      }).addAttribution('CivicReport Admin').addTo(mapInstanceRef.current)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers based on filtered reports
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = {}

    // Add markers for filtered reports
    filteredReports.forEach((report) => {
      if (report.location) {
        const statusColors = {
          'new': '#EF4444',
          'acknowledged': '#F59E0B',
          'in_progress': '#3B82F6',
          'resolved': '#10B981'
        }

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative">
              <div class="w-8 h-8 rounded-full shadow-lg border-3 border-white" style="background-color: ${statusColors[report.status] || '#6B7280'}">
                <div class="w-full h-full rounded-full animate-ping opacity-30" style="background-color: ${statusColors[report.status] || '#6B7280'}"></div>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${getPriorityColor(report.priority)}"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        })

        const marker = L.marker([report.location.lat, report.location.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            setSelectedReport(report)
            setRightPanelOpen(true)
          })

        markersRef.current[report.id] = marker
      }
    })
  }, [reports, selectedDepartment, statusFilter, priorityFilter, searchTerm])

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#6B7280'
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      'new': 'bg-red-50 text-red-700 border border-red-200',
      'acknowledged': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'in_progress': 'bg-blue-50 text-blue-700 border border-blue-200',
      'resolved': 'bg-green-50 text-green-700 border border-green-200'
    }
    return classes[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'pothole': Construction,
      'garbage': Trash2,
      'streetlight': Lightbulb,
      'water_leak': Droplets,
      'other': MoreHorizontal
    }
    return icons[category] || MoreHorizontal
  }

  const handleStatusChange = async (reportId, newStatus) => {
    setIsUpdating(true)
    try {
      console.log(`Updating report ${reportId} to status: ${newStatus}`)
      
      const response = await fetch(`http://localhost:3001/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { ...report, status: newStatus }
              : report
          )
        )
        
        setSelectedReport(prev => 
          prev && prev.id === reportId 
            ? { ...prev, status: newStatus }
            : prev
        )
        
        // Recalculate stats
        const updatedReports = reports.map(r => 
          r.id === reportId ? { ...r, status: newStatus } : r
        )
        const newStats = {
          total: updatedReports.length,
          new: updatedReports.filter(r => r.status === 'new').length,
          inProgress: updatedReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length,
          resolved: updatedReports.filter(r => r.status === 'resolved').length
        }
        setStats(newStats)
        
        console.log('Report updated successfully')
      } else {
        console.error('Failed to update report:', result.error)
        alert('Failed to update report status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update report status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendUpdate = async () => {
    if (!updateMessage.trim() || !selectedReport) return
    
    setIsUpdating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUpdate = {
        message: updateMessage,
        timestamp: new Date().toISOString(),
        officer: 'Government Official'
      }
      
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id 
            ? { ...report, updates: [...(report.updates || []), newUpdate] }
            : report
        )
      )
      
      setSelectedReport(prev => ({
        ...prev,
        updates: [...(prev.updates || []), newUpdate]
      }))
      
      setUpdateMessage('')
    } catch (error) {
      console.error('Failed to send update:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const playAudio = (reportId, audioUrl) => {
    Object.values(audioElements || {}).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })

    if (playingAudio === reportId) {
      setPlayingAudio(null)
      return
    }

    // For demo purposes, we'll just simulate audio playback
    setPlayingAudio(reportId)
    setTimeout(() => setPlayingAudio(null), 3000)
  }

  // Filter reports based on department, status, priority, and search
  const filteredReports = reports.filter(report => {
    const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesDepartment && matchesStatus && matchesPriority && matchesSearch
  })

  const getSelectedDepartment = () => {
    return departments.find(dept => dept.id === selectedDepartment)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-blue-600 rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Government Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Search and Filters */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Departments List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {departments.map((department) => {
              const IconComponent = department.icon
              const isSelected = selectedDepartment === department.id
              return (
                <button
                  key={department.id}
                  onClick={() => setSelectedDepartment(department.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{department.name}</div>
                      <div className="text-xs text-gray-500">{department.count} reports</div>
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {filteredReports.filter(r => department.id === 'all' || r.department === department.id).length}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Admin Officer</div>
                  <div className="text-xs text-gray-500">Government Official</div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 relative">
        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {React.createElement(getSelectedDepartment()?.icon, { 
              className: `w-5 h-5 ${getSelectedDepartment()?.color} text-white p-1 rounded` 
            })}
            <div>
              <h3 className="font-semibold text-gray-900">{getSelectedDepartment()?.name}</h3>
              <p className="text-sm text-gray-600">{filteredReports.length} active reports</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Report Status</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">New</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">Acknowledged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Report Details */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        rightPanelOpen ? 'w-96' : 'w-0'
      } flex-shrink-0 overflow-hidden`}>
        {selectedReport && (
          <div className="w-96 h-full flex flex-col">
            {/* Panel Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <h2 className="font-semibold text-gray-900">Report Details</h2>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Report Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">#{selectedReport.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedReport.status)}`}>
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedReport.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedReport.description}</p>
                </div>

                {/* Report Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Category</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {React.createElement(getCategoryIcon(selectedReport.category), { className: "w-4 h-4 text-gray-600" })}
                      <span className="font-medium capitalize">{selectedReport.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border`} 
                            style={{ 
                              color: getPriorityColor(selectedReport.priority),
                              borderColor: getPriorityColor(selectedReport.priority) + '40',
                              backgroundColor: getPriorityColor(selectedReport.priority) + '10'
                            }}>
                        {selectedReport.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Urgency</span>
                    <div className="font-medium mt-1">{selectedReport.urgency_score}/10</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reporter</span>
                    <div className="font-medium mt-1">{selectedReport.user_name}</div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <span className="text-sm text-gray-500">Location</span>
                  <div className="flex items-start space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-900">{selectedReport.address}</span>
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.image_urls && selectedReport.image_urls.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 mb-2 block">Photos ({selectedReport.image_urls.length})</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.image_urls.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Report photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio */}
                {selectedReport.audio_url && (
                  <div>
                    <span className="text-sm text-gray-500 mb-2 block">Voice Note</span>
                    <button
                      onClick={() => playAudio(selectedReport.id, selectedReport.audio_url)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      {playingAudio === selectedReport.id ? (
                        <Pause className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Play className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-blue-600 font-medium">
                        {playingAudio === selectedReport.id ? 'Playing...' : 'Play Audio'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Updates History */}
                {selectedReport.updates && selectedReport.updates.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 mb-2 block">Updates</span>
                    <div className="space-y-2">
                      {selectedReport.updates.map((update, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-900">{update.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{update.officer}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(update.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div>
                  <span className="text-sm text-gray-500">Reported</span>
                  <div className="text-sm text-gray-900 mt-1">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Footer - Actions */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Status Update Actions */}
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">Update Status</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'acknowledged')}
                    disabled={selectedReport.status === 'acknowledged' || isUpdating}
                    className="px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedReport.status === 'acknowledged' ? '✓ Acknowledged' : 'Acknowledge'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'in_progress')}
                    disabled={selectedReport.status === 'in_progress' || selectedReport.status === 'resolved' || isUpdating}
                    className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedReport.status === 'in_progress' ? '✓ In Progress' : 'Start Work'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                    disabled={selectedReport.status === 'resolved' || isUpdating}
                    className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed col-span-2"
                  >
                    {selectedReport.status === 'resolved' ? '✓ Resolved' : 'Mark as Resolved'}
                  </button>
                </div>
              </div>

              {/* Send Update to Citizen */}
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">Send Update to Citizen</span>
                <div className="space-y-2">
                  <textarea
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="Write an update for the citizen..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />
                  <button
                    onClick={handleSendUpdate}
                    disabled={!updateMessage.trim() || isUpdating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Update</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <Eye className="w-4 h-4" />
                  <span>View Full</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Notification */}
      {isUpdating && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-900">Processing request...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard