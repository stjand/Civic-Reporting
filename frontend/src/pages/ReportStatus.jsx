// File: frontend/src/pages/ReportStatus.jsx
import React, { useState, useEffect } from 'react'
// import { useParams, Link, useNavigate } from 'react-router-dom' // <-- REMOVED: Incompatible with custom router
import { CheckCircle, Clock, MapPin, User, FileText, Loader2, ArrowLeft, Shield, Search, AlertTriangle } from 'lucide-react'

// CRITICAL FIX: Custom navigation function to trigger App.jsx's router logic
const navigate = (path) => {
    if (path) {
        window.history.pushState({}, '', path)
        window.dispatchEvent(new Event('navigate'))
    }
}

const ReportStatus = () => {
  // FIX: Get ID directly from window.location.pathname, replacing useParams()
  const path = window.location.pathname;
  // Extracts ID like 'RPT-001' from '/status/RPT-001' or returns null for '/status'
  const idMatch = path.match(/\/status\/(RPT-\d+)/i);
  const id = idMatch ? idMatch[1].toUpperCase() : null;
  
  // const { id } = useParams() // <-- REMOVED
  // const navigate = useNavigate() // <-- REMOVED
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false) 
  // Initialize input with ID from URL if present
  const [reportIdInput, setReportIdInput] = useState(id || '') 

  // Function to handle the search button click/Enter key press
  const handleSearch = () => {
    if (reportIdInput) {
      // Use custom navigate to change the URL and trigger re-render in App.jsx
      navigate(`/status/${reportIdInput.toUpperCase()}`);
    }
  };

  // Mock API call to fetch report details
  useEffect(() => {
    // Only attempt to fetch if an ID is present in the URL
    if (id) {
        setLoading(true)
        setReport(null) // Clear previous report
        const fetchReport = async () => {
            try {
                // Simulate fetching data for a report
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // --- Mock Logic for Demonstration ---
                let mockReport = null
                if (id.toUpperCase() === 'RPT-001' || id.toUpperCase() === 'RPT-002' || id.toUpperCase() === 'RPT-003') {
                    // Simulate successful fetch for known IDs
                    mockReport = {
                        id: id.toUpperCase(),
                        title: 'Large pothole on Main Street',
                        description: 'A major and deep pothole located near the crosswalk. It poses a significant hazard to motorcyclists and cyclists.',
                        category: 'Pothole/Road Damage',
                        location: 'Main Street, near City Park',
                        user: 'Citizen Reporter',
                        status: id.toUpperCase() === 'RPT-001' ? 'Resolved' : id.toUpperCase() === 'RPT-002' ? 'In Progress' : 'New',
                        priority: id.toUpperCase() === 'RPT-001' ? 'Medium' : 'High',
                        department: 'Roads & Infrastructure',
                        submitted: '2024-05-15T10:00:00Z',
                        image_url: 'https://via.placeholder.com/300x200?text=Report+Image',
                        timeline: [
                            { status: 'Report Submitted', date: new Date('2024-05-15T10:00:00Z'), icon: FileText },
                            { status: 'New', date: new Date('2024-05-15T10:05:00Z'), icon: Clock },
                            ...(id.toUpperCase() !== 'RPT-003' ? [{ status: 'Acknowledged', date: new Date('2024-05-15T14:30:00Z'), icon: Shield }] : []),
                            ...(id.toUpperCase() === 'RPT-001' ? [
                                { status: 'In Progress', date: new Date('2024-05-16T09:00:00Z'), icon: Loader2 },
                                { status: 'Resolved', date: new Date('2024-05-17T15:00:00Z'), icon: CheckCircle }
                            ] : []),
                            ...(id.toUpperCase() === 'RPT-002' ? [
                                { status: 'In Progress', date: new Date('2024-05-16T11:00:00Z'), icon: Loader2 },
                                { status: 'Inspection Scheduled', date: new Date('2024-05-17T13:00:00Z'), icon: Search },
                                { status: 'Work in Progress', date: null, icon: Loader2, className: 'animate-pulse' }
                            ] : []),
                        ],
                    }
                }

                setReport(mockReport)
                // --- End Mock Logic ---

            } catch (error) {
                console.error('Failed to fetch report:', error)
                setReport(null)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    } else {
        // If no ID in URL, ensure we are not loading and have no report displayed
        setLoading(false);
        setReport(null);
    }
  }, [id]) // Rerun effect whenever ID changes (i.e., when user navigates to a new status link)

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-500'
      case 'in progress':
      case 'acknowledged':
      case 'work in progress':
        return 'bg-yellow-500'
      case 'new':
        return 'bg-blue-500'
      case 'inspection scheduled':
        return 'bg-indigo-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 border-red-200 bg-red-50'
      case 'medium':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'low':
        return 'text-green-600 border-green-200 bg-green-50'
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header and Search Bar */}
        <div className="flex items-center space-x-3 mb-8">
            <ArrowLeft onClick={() => navigate('/')} className="w-6 h-6 cursor-pointer text-gray-600 hover:text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Report Status Tracker</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Find Your Report</h2>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter Report ID (e.g., RPT-001)"
                value={reportIdInput}
                onChange={(e) => setReportIdInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={!reportIdInput}
                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading report details...</p>
            </div>
          )}

          {!loading && id && !report && (
            <div className="p-10 text-center bg-red-50">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-red-800">Report Not Found</h3>
              <p className="text-red-700 mt-2">Could not find report with ID: **{id}**. Please check the ID and try again.</p>
            </div>
          )}
          
          {/* Default State (No ID in URL) */}
          {!loading && !id && !report && (
            <div className="p-10 text-center">
                <Search className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">Track Your Report</h3>
                <p className="text-gray-600 mt-2">Enter a valid Report ID in the search bar above to view its current status and timeline.</p>
            </div>
          )}


          {/* Report Display */}
          {report && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{report.title}</h3>
                  <div className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                    Priority: {report.priority}
                  </div>
                </div>
                <div className={`px-4 py-2 text-white font-semibold rounded-full text-sm ${getStatusColor(report.status)}`}>
                  {report.status}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 border-t border-b border-gray-200 py-4">
                <p className="flex items-center"><User className="w-4 h-4 mr-2" /> Submitted by: {report.user}</p>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Submitted on: {new Date(report.submitted).toLocaleDateString()}</p>
                <p className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Category: {report.category}</p>
                <p className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Department: {report.department}</p>
              </div>

              {/* Description & Location */}
              <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Description</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{report.description}</p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location</h4>
                    <p className="text-gray-600">{report.location}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Resolution Timeline</h4>
                <div className="relative border-l border-gray-200 space-y-8 pl-4">
                  {report.timeline.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div key={index} className="relative">
                        <div className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(item.status)} ${item.className || ''}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <h5 className="font-medium text-gray-900">{item.status}</h5>
                        {item.date && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString()}
                          </p>
                        )}
                        {!item.date && item.status === 'pending' && (
                          <p className="text-sm text-gray-400 mt-1">
                            Pending completion
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/status')}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 border rounded-lg bg-white"
                >
                    Track Another ID
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportStatus;