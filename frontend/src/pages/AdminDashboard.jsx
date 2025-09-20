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
  Send,
  Menu,
  Home,
  Users,
  Activity,
  TrendingUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  Star,
  MapIcon,
  ArrowLeft,
  ChevronDown,
  UserCircle
} from 'lucide-react'

// Fix for default markers in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports, setReports] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [updateMessage, setUpdateMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mock official profile
  const officialProfile = {
    name: "Dr. Rajesh Kumar",
    designation: "Chief Municipal Officer",
    department: "Municipal Corporation",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  }

  // Departments data
  const departments = [
    { 
      id: 'all', 
      name: 'All Departments', 
      icon: Building2, 
      color: 'bg-blue-600',
      count: 0
    },
    { 
      id: 'municipal', 
      name: 'Municipal', 
      icon: Building2, 
      color: 'bg-indigo-600',
      count: 0
    },
    { 
      id: 'electrical', 
      name: 'Electrical', 
      icon: Zap, 
      color: 'bg-yellow-600',
      count: 0
    },
    { 
      id: 'roads', 
      name: 'Roads & Infrastructure', 
      icon: Construction, 
      color: 'bg-orange-600',
      count: 0
    },
    { 
      id: 'sanitation', 
      name: 'Sanitation', 
      icon: Trash2, 
      color: 'bg-green-600',
      count: 0
    },
    { 
      id: 'water', 
      name: 'Water & Drainage', 
      icon: Droplets, 
      color: 'bg-cyan-600',
      count: 0
    }
  ]

  // Enhanced mock data
  const mockReports = [
    {
      id: 1,
      title: 'Severe pothole causing traffic delays',
      description: 'Large pothole on MG Road junction causing significant traffic congestion and vehicle damage. Multiple complaints received from citizens. The pothole is approximately 3 feet wide and 8 inches deep, making it dangerous for vehicles especially during night hours.',
      category: 'pothole',
      department: 'roads',
      status: 'new',
      priority: 'high',
      urgency_score: 9,
      location: { lat: 12.9716, lng: 77.5946 },
      address: 'MG Road Junction, Near City Center, Bengaluru, Karnataka, India',
      user_name: 'Rajesh Kumar',
      created_at: '2024-01-20T10:30:00Z',
      image_urls: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop'
      ],
      audio_url: null,
      updates: []
    },
    {
      id: 2,
      title: 'Overflowing waste bins in residential area',
      description: 'Multiple garbage bins overflowing for the past 5 days in Brigade Road area. Creating health hazards and attracting stray animals. The waste is spilling onto the street and creating an unhygienic environment.',
      category: 'garbage',
      department: 'sanitation',
      status: 'in_progress',
      priority: 'medium',
      urgency_score: 6,
      location: { lat: 12.9352, lng: 77.6245 },
      address: 'Brigade Road, Commercial Street Area, Bengaluru, Karnataka, India',
      user_name: 'Priya Sharma',
      created_at: '2024-01-19T14:45:00Z',
      image_urls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop'],
      updates: [
        { 
          message: 'Waste collection team has been notified and scheduled for tomorrow morning. Additional bins will be placed in the area.',
          timestamp: '2024-01-20T09:00:00Z', 
          officer: 'Sanitation Department' 
        }
      ]
    },
    {
      id: 3,
      title: 'Street lighting system malfunction',
      description: 'Entire street lighting system in Koramangala 5th Block has been non-functional for over a week, creating safety concerns for residents. The transformer seems to have issues.',
      category: 'streetlight',
      department: 'electrical',
      status: 'acknowledged',
      priority: 'high',
      urgency_score: 7,
      location: { lat: 12.9279, lng: 77.6271 },
      address: 'Koramangala 5th Block, Main Road, Bengaluru, Karnataka, India',
      user_name: 'Amit Patel',
      created_at: '2024-01-18T20:15:00Z',
      image_urls: ['https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=400&h=300&fit=crop'],
      updates: []
    },
    {
      id: 4,
      title: 'Water pipe burst - Emergency',
      description: 'Major water pipeline burst on Whitefield Main Road causing severe flooding and traffic disruption. Water is flowing onto the main road creating dangerous driving conditions.',
      category: 'water_leak',
      department: 'water',
      status: 'resolved',
      priority: 'urgent',
      urgency_score: 10,
      location: { lat: 12.9698, lng: 77.7500 },
      address: 'Whitefield Main Road, ITPL Area, Bengaluru, Karnataka, India',
      user_name: 'Sunita Reddy',
      created_at: '2024-01-17T08:30:00Z',
      image_urls: ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop'],
      updates: [
        { 
          message: 'Emergency response team dispatched immediately to assess the situation.',
          timestamp: '2024-01-17T08:45:00Z', 
          officer: 'Water Department' 
        },
        { 
          message: 'Pipeline repair completed successfully. Water supply has been restored to all affected areas.',
          timestamp: '2024-01-17T15:30:00Z', 
          officer: 'Water Department' 
        }
      ]
    },
    {
      id: 5,
      title: 'Broken traffic signal at major intersection',
      description: 'Traffic signal at the busy intersection of Residency Road and Brigade Road has been malfunctioning since yesterday, causing traffic chaos during peak hours.',
      category: 'other',
      department: 'municipal',
      status: 'acknowledged',
      priority: 'high',
      urgency_score: 8,
      location: { lat: 12.9698, lng: 77.6100 },
      address: 'Residency Road & Brigade Road Junction, Bengaluru, Karnataka, India',
      user_name: 'Arjun Singh',
      created_at: '2024-01-21T07:15:00Z',
      image_urls: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'],
      updates: [
        { 
          message: 'Technical team assigned to inspect and repair the traffic signal system.',
          timestamp: '2024-01-21T10:30:00Z', 
          officer: 'Traffic Management' 
        }
      ]
    }
  ]

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setReports(mockReports)
        
        // Calculate stats
        const newCount = mockReports.filter(r => r.status === 'new').length
        const inProgressCount = mockReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length
        const resolvedCount = mockReports.filter(r => r.status === 'resolved').length
        
        setStats({
          total: mockReports.length,
          new: newCount,
          inProgress: inProgressCount,
          resolved: resolvedCount
        })
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && !isLoading) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([12.9716, 77.5946], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)

      // Custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLoading])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = {}

    // Add new markers
    filteredReports.forEach((report) => {
      if (report.location) {
        const statusColors = {
          'new': '#EF4444',
          'acknowledged': '#F59E0B',
          'in_progress': '#3B82F6',
          'resolved': '#10B981'
        }

        const prioritySize = {
          'urgent': 16,
          'high': 14,
          'medium': 12,
          'low': 10
        }

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative cursor-pointer">
              <div class="flex items-center justify-center rounded-full border-3 border-white shadow-lg transform hover:scale-110 transition-transform duration-200" 
                   style="width: ${prioritySize[report.priority] || 12}px; height: ${prioritySize[report.priority] || 12}px; background-color: ${statusColors[report.status]}">
              </div>
              <div class="absolute inset-0 rounded-full opacity-40 animate-ping"
                   style="background-color: ${statusColors[report.status]}"></div>
            </div>
          `,
          iconSize: [prioritySize[report.priority] || 12, prioritySize[report.priority] || 12],
          iconAnchor: [(prioritySize[report.priority] || 12) / 2, (prioritySize[report.priority] || 12) / 2]
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
  }, [reports, selectedDepartment, statusFilter, priorityFilter, searchTerm, isLoading])

  // Filter logic
  const filteredReports = reports.filter(report => {
    const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    
    return matchesDepartment && matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-500',
      'acknowledged': 'bg-yellow-500',
      'in_progress': 'bg-blue-500',
      'resolved': 'bg-green-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    }
    return badges[priority] || 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleStatusUpdate = async (reportId, newStatus) => {
    setIsUpdating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ))
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }))
      }

      // Update stats
      const updatedReports = reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      const newCount = updatedReports.filter(r => r.status === 'new').length
      const inProgressCount = updatedReports.filter(r => ['acknowledged', 'in_progress'].includes(r.status)).length
      const resolvedCount = updatedReports.filter(r => r.status === 'resolved').length
      
      setStats({
        total: updatedReports.length,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update report status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching the latest reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Left Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Profile Section */}
        <div className={`p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${
          sidebarCollapsed ? 'px-2' : ''
        }`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <img
                src={officialProfile.avatar}
                alt={officialProfile.name}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{officialProfile.name}</h3>
                <p className="text-blue-100 text-sm truncate">{officialProfile.designation}</p>
                <p className="text-blue-200 text-xs truncate">{officialProfile.department}</p>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={officialProfile.avatar}
                alt={officialProfile.name}
                className="w-8 h-8 rounded-full border-2 border-white/20"
              />
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters (only when not collapsed) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-200 rounded-lg"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="mt-3 space-y-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 bg-white rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 bg-white rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Department List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {departments.map((department) => {
              const IconComponent = department.icon
              const isSelected = selectedDepartment === department.id
              const departmentReports = department.id === 'all' 
                ? reports 
                : reports.filter(r => r.department === department.id)
              
              return (
                <button
                  key={department.id}
                  onClick={() => setSelectedDepartment(department.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? department.name : ''}
                >
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{department.name}</div>
                        <div className="text-sm text-gray-500">
                          {departmentReports.length} reports
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {filteredReports.filter(r => department.id === 'all' || r.department === department.id).length}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats Summary (only when not collapsed) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <div className="text-lg font-bold text-red-600">{stats.new}</div>
                <div className="text-xs text-gray-600">New</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <div className="text-lg font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <div className="text-lg font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <div className="text-lg font-bold text-gray-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button (only when not collapsed) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Top Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-lg text-gray-900">Government Dashboard</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-600">
                {filteredReports.length} of {reports.length} reports
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.new}
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Floating Filter FAB */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute bottom-6 left-6 z-10 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Map Status Indicator */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <MapIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {filteredReports.length} Reports Visible
              </span>
            </div>
          </div>

          {/* Enhanced Map Legend */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Status Legend</h4>
            <div className="space-y-2">
              {[
                { status: 'new', label: 'New Reports', color: 'bg-red-500', count: stats.new },
                { status: 'acknowledged', label: 'Acknowledged', color: 'bg-yellow-500', count: filteredReports.filter(r => r.status === 'acknowledged').length },
                { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500', count: filteredReports.filter(r => r.status === 'in_progress').length },
                { status: 'resolved', label: 'Resolved', color: 'bg-green-500', count: stats.resolved }
              ].map(({ status, label, color, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Click on any marker to view details
              </div>
            </div>
          </div>

          {/* Map */}
          <div
            ref={mapRef}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Enhanced Right Panel - Report Details */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
        rightPanelOpen ? 'w-96' : 'w-0'
      } overflow-hidden shadow-xl`}>
        {selectedReport && rightPanelOpen && (
          <div className="w-96 h-full flex flex-col">
            {/* Enhanced Panel Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-500">#{selectedReport.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(selectedReport.priority)}`}>
                  {selectedReport.priority?.toUpperCase()}
                </span>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedReport.status)}`}></div>
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {selectedReport.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Title and Description */}
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">{selectedReport.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedReport.description}</p>
                </div>

                {/* Issue Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Issue Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Category:</span>
                      <div className="flex items-center space-x-2">
                        {React.createElement(getCategoryIcon(selectedReport.category), { className: "w-4 h-4 text-gray-600" })}
                        <span className="font-medium capitalize">{selectedReport.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Urgency Score:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              selectedReport.urgency_score >= 8 ? 'bg-red-500' :
                              selectedReport.urgency_score >= 6 ? 'bg-yellow-500' :
                              selectedReport.urgency_score >= 4 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${selectedReport.urgency_score * 10}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900">{selectedReport.urgency_score}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reporter:</span>
                      <span className="font-medium">{selectedReport.user_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900 font-medium">{selectedReport.address}</p>
                    <p className="text-xs text-blue-700">
                      Coordinates: {selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.image_urls && selectedReport.image_urls.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      Evidence Photos ({selectedReport.image_urls.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedReport.image_urls.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio */}
                {selectedReport.audio_url && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Voice Note
                    </h4>
                    <button
                      onClick={() => setPlayingAudio(playingAudio === selectedReport.id ? null : selectedReport.id)}
                      className="flex items-center space-x-3 px-4 py-3 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium w-full"
                    >
                      {playingAudio === selectedReport.id ? (
                        <Pause className="w-5 h-5 text-green-600" />
                      ) : (
                        <Play className="w-5 h-5 text-green-600" />
                      )}
                      <span className="text-green-700">
                        {playingAudio === selectedReport.id ? 'Pause Audio' : 'Play Audio'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Update History */}
                {selectedReport.updates && selectedReport.updates.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Update History
                    </h4>
                    <div className="space-y-3">
                      {selectedReport.updates.map((update, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-gray-900 mb-2">{update.message}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-700 font-medium">{update.officer}</span>
                            <span className="text-amber-600">
                              {new Date(update.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Panel Footer - Actions */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="p-6 space-y-4">
                {/* Status Update Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'acknowledged')}
                      disabled={selectedReport.status === 'acknowledged' || isUpdating}
                      className="px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedReport.status === 'acknowledged' ? '✓ Acknowledged' : 'Acknowledge'}
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'in_progress')}
                      disabled={selectedReport.status === 'in_progress' || selectedReport.status === 'resolved' || isUpdating}
                      className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedReport.status === 'in_progress' ? '✓ In Progress' : 'Start Work'}
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                      disabled={selectedReport.status === 'resolved' || isUpdating}
                      className="col-span-2 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedReport.status === 'resolved' ? '✓ Resolved' : 'Mark as Resolved'}
                    </button>
                  </div>
                </div>

                {/* Send Update */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Update to Citizen
                  </h4>
                  <div className="space-y-2">
                    <textarea
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Write an update message for the citizen..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 rounded-lg resize-none text-sm"
                    />
                    <button
                      onClick={() => {
                        if (!updateMessage.trim()) return
                        
                        // Add update to local state
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
                      disabled={!updateMessage.trim() || isUpdating}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
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
                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    <span>Full View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-900 font-medium">Processing request...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard