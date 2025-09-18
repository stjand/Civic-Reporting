// File: frontend/src/pages/AdminDashboard.jsx
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
  BarChart3
} from 'lucide-react'
import { apiClient } from '../config/api'

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
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0
  })
  const [filterStatus, setFilterStatus] = useState('all')

  // New useEffect hook to fetch data from the API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get('/reports')
        const fetchedReports = response.data.data // Access the correct data field
        setReports(fetchedReports)

        // Calculate stats from fetched data
        const newReports = fetchedReports.filter(r => r.status === 'new').length
        const acknowledged = fetchedReports.filter(r => r.status === 'acknowledged').length
        const inProgress = fetchedReports.filter(r => r.status === 'in_progress').length
        const resolved = fetchedReports.filter(r => r.status === 'resolved').length

        setStats({
          total: fetchedReports.length,
          new: newReports,
          inProgress: acknowledged + inProgress,
          resolved: resolved
        })
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      }
    }

    fetchReports()
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current && reports.length > 0) { // Check for reports data before initializing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      mapInstanceRef.current = L.map(mapRef.current).setView([12.9716, 77.5946], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)

      reports.forEach((report) => {
        // Add a check to ensure report.location exists before trying to create a marker
        if (report.location) {
          const statusColors = {
            'new': 'bg-red-500',
            'acknowledged': 'bg-yellow-500',
            'in_progress': 'bg-blue-500',
            'resolved': 'bg-green-500'
          }
  
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="relative w-6 h-6 rounded-full ${statusColors[report.status] || 'bg-gray-500'} shadow-lg border-2 border-white"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          })
  
          const marker = L.marker([report.location.lat, report.location.lng], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .on('click', () => {
              setSelectedReport(report)
            })
  
          const popupContent = `
            <div class="p-3 font-sans text-gray-800 min-w-48">
              <h3 class="text-sm font-bold mb-2 text-gray-900">${report.title}</h3>
              <p class="text-xs text-gray-600 mb-2">${report.address}</p>
              <div class="flex items-center justify-between">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(report.status)}">${report.status.replace('_', ' ').toUpperCase()}</span>
                <span class="text-xs font-mono text-gray-500">#${report.id}</span>
              </div>
            </div>
          `
          marker.bindPopup(popupContent)
        }
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [reports])

  const getStatusBadgeClass = (status) => {
    const classes = {
      'new': 'bg-red-100 text-red-800 border border-red-200',
      'acknowledged': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'in_progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      'resolved': 'bg-green-100 text-green-800 border border-green-200'
    }
    return classes[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleStatusChange = (reportId, newStatus) => {
    setReports(reports.map(report =>
      report.id === reportId
        ? { ...report, status: newStatus }
        : report
    ))

    // Update selected report if it's the one being changed
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }))
    }

    // Show success message (in a real app, this would be a proper notification)
    alert(`Report #${reportId} status updated to: ${newStatus.replace('_', ' ')}`)
  }

  const filteredReports = filterStatus === 'all'
    ? reports
    : reports.filter(report => report.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage civic reports and track progress</p>
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="flex justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.new}</div>
            <div className="text-sm text-gray-600">New Reports</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="flex justify-center mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Reports Map</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    Interactive view of all reports
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click on markers to view report details
                </p>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredReports.map((report) => {
                    const IconComponent = getCategoryIcon(report.category)
                    return (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedReport?.id === report.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm">
                              <IconComponent className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-sm">#{report.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                              {report.status?.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                              {report.priority?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-medium text-sm mb-1 text-gray-900">{report.title}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{report.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{report.user_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Urgency: {report.urgency_score || 0}/10</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Report Details */}
        {selectedReport && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Report Details - #{selectedReport.id}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Report Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium text-gray-900 text-right">{selectedReport.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <div className="flex items-center space-x-1">
                          {React.createElement(getCategoryIcon(selectedReport.category), { className: "w-4 h-4 text-gray-600" })}
                          <span className="font-medium text-gray-900 capitalize">{selectedReport.category?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedReport.priority)}`}>
                          {selectedReport.priority?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedReport.status)}`}>
                          {selectedReport.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgency Score:</span>
                        <span className="font-medium text-gray-900">{selectedReport.urgency_score || 0}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900 text-right max-w-48">{selectedReport.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordinates:</span>
                        <span className="font-mono text-xs text-gray-600">
                          {selectedReport.location?.lat.toFixed(4)}, {selectedReport.location?.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported by:</span>
                        <span className="font-medium text-gray-900">{selectedReport.user_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{new Date(selectedReport.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusChange(selectedReport.id, 'acknowledged')}
                        disabled={selectedReport.status === 'acknowledged'}
                        className="w-full px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Acknowledge Report
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedReport.id, 'in_progress')}
                        disabled={selectedReport.status === 'in_progress'}
                        className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-4 h-4 inline mr-2" />
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                        disabled={selectedReport.status === 'resolved'}
                        className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard