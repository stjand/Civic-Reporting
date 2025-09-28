// File: frontend/src/pages/ReportStatus.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, User, FileText, Loader2, ArrowLeft, Shield, Search } from 'lucide-react'

const ReportStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate() // Hook to handle internal navigation
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false) // Set to false initially, only load when ID is present
  const [reportIdInput, setReportIdInput] = useState('')

  // Mock API call to fetch report details
  useEffect(() => {
    // Only attempt to fetch if an ID is present in the URL
    if (id) {
        setLoading(true)
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
                        description: 'Deep pothole causing vehicle damage near traffic signal intersection',
                        status: 'In Progress',
                        category: 'Road Maintenance',
                        location: 'Main Street, near City Center',
                        reporter: 'Jane Doe',
                        createdAt: '2025-09-01T10:00:00Z',
                        timeline: [
                            { step: 'Report Submitted', date: '2025-09-01T10:00:00Z', status: 'completed' },
                            { step: 'Under Review', date: '2025-09-01T10:05:00Z', status: 'completed' },
                            { step: 'In Progress', date: '2025-09-02T09:30:00Z', status: 'current' },
                            { step: 'Resolved', date: null, status: 'pending' }
                        ]
                    }
                }
                // --- End Mock Logic ---

                setReport(mockReport)
            } catch (error) {
                console.error('Failed to fetch report:', error)
                setReport(null)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    } else {
        // If no ID, ensure loading is false and report is null
        setLoading(false)
        setReport(null)
    }
  }, [id])

  const handleSearch = (e) => {
    e.preventDefault()
    if (reportIdInput.trim()) {
      // Navigate to the new URL with the entered ID
      navigate(`/status/${reportIdInput.trim().toUpperCase()}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'Resolved': return 'bg-green-100 text-green-800 border border-green-200'
      case 'Submitted': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Under Review': return 'bg-purple-100 text-purple-800 border border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getTimelineIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'completed': 
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        )
      case 'current': 
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
        )
      case 'pending': 
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full border-2 border-gray-300">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        )
      default: return null
    }
  }

  // --- Common Header for all states ---
  const Header = () => (
    <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-lg text-gray-900">Report Status Tracker</span>
              </div>
            </div>
            {report && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
            )}
          </div>
        </div>
      </div>
  )
  
  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading report status for ID: {id}...</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Report Not Found State (only when an ID was searched for) ---
  if (!report && id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
            <p className="text-gray-600 mb-6">The report ID "{id}" could not be found. Please check the ID and try again.</p>
            <button
              onClick={() => navigate('/status')} // Go back to the input form
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try a Different ID
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Report ID Input Form (when /status is accessed) ---
  if (!id) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 pt-16">
                <div className="card p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Track Your Report</h1>
                    <p className="text-gray-600 mb-8">
                        Enter your unique Report ID below to view the latest status and progress timeline.
                    </p>
                    
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={reportIdInput}
                            onChange={(e) => setReportIdInput(e.target.value)}
                            placeholder="e.g., RPT-001"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary px-6 py-3 flex items-center justify-center"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Check Status
                        </button>
                    </form>

                    <Link to="/" className="text-sm text-gray-500 mt-6 block hover:text-blue-600 transition">
                        Back to Home Page
                    </Link>
                </div>
            </div>
        </div>
    )
  }

  // --- Main Report Detail View (when ID is found) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Report Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {report.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>ID: {report.id}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>By: {report.reporter}</span>
                  </div>
                  <div>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-900">{report.category}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-900">{report.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 text-sm leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Timeline</h2>
            <div className="space-y-6">
              {report.timeline.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    {getTimelineIcon(item.status)}
                    {index < report.timeline.length - 1 && (
                      <div className={`w-px h-12 mt-2 ${
                        item.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        item.status === 'completed' ? 'text-gray-900' : 
                        item.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {item.step}
                      </h3>
                      {item.status === 'current' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    {item.date && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    )}
                    {!item.date && item.status === 'pending' && (
                      <p className="text-sm text-gray-400 mt-1">
                        Pending completion
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportStatus