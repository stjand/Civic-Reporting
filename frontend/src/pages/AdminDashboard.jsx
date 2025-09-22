import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Search, Menu, List, Map, Filter, Bell, User, Settings,
  X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock,
  CheckCircle, AlertTriangle, Construction, Droplets, Zap, Trash2,
  Building2, Users, Shield, Eye, MessageSquare, Flag, RefreshCw,
  Navigation, Layers, Plus, Minus, Home, BarChart3, Mic, Camera
} from 'lucide-react';
import { apiClient } from '../config/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Department configurations mapped to your backend categories
const departments = [
  { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-gray-600' },
  { id: 'pothole', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-600' },
  { id: 'water_leak', name: 'Water & Drainage', icon: Droplets, color: 'bg-blue-600' },
  { id: 'streetlight', name: 'Street Lighting', icon: Zap, color: 'bg-yellow-600' },
  { id: 'garbage', name: 'Waste Management', icon: Trash2, color: 'bg-green-600' },
  { id: 'other', name: 'Other Issues', icon: Building2, color: 'bg-indigo-600' }
];

// Enhanced Map Component with real Leaflet integration
const MapView = ({ reports, selectedReport, onReportSelect }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const getMarkerIcon = (status, isSelected = false) => {
    const colors = {
      'new': '#ef4444',
      'in_progress': '#eab308', 
      'acknowledged': '#3b82f6',
      'resolved': '#22c55e'
    };
    
    const color = colors[status] || '#6b7280';
    const size = isSelected ? 32 : 24;
    const opacity = isSelected ? '1' : '0.8';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        opacity: ${opacity};
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([17.4239, 78.4738], 11);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when reports or selectedReport changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        const isSelected = selectedReport?.id === report.id;
        const marker = L.marker([parseFloat(report.latitude), parseFloat(report.longitude)], {
          icon: getMarkerIcon(report.status, isSelected)
        }).addTo(mapInstanceRef.current);

        marker.on('click', () => onReportSelect(report));
        
        // Add popup with basic info
        marker.bindPopup(`
          <div class="font-semibold text-sm mb-1">${report.title}</div>
          <div class="text-xs text-gray-600 mb-2">${report.status.replace('_', ' ').toUpperCase()}</div>
          <div class="text-xs text-gray-500">${report.address || 'Location not specified'}</div>
        `);

        markersRef.current.push(marker);
      }
    });

    // Center map on selected report
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      mapInstanceRef.current.setView([parseFloat(selectedReport.latitude), parseFloat(selectedReport.longitude)], 15);
    }
  }, [reports, selectedReport, mapLoaded, onReportSelect]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-semibold mb-2">Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>New</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Acknowledged</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Reports count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{reports.length} Reports</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Report Detail Panel
const ReportDetailPanel = ({ report, onClose, onStatusUpdate }) => {
  if (!report) return null;

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-100 text-red-800 border-red-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'acknowledged': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 border-red-300',
      'high': 'bg-orange-100 text-orange-800 border-orange-300',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'low': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Parse image URLs from JSON string
  const imageUrls = React.useMemo(() => {
    if (!report.image_urls) return [];
    try {
      return typeof report.image_urls === 'string' 
        ? JSON.parse(report.image_urls) 
        : report.image_urls;
    } catch (e) {
      return [];
    }
  }, [report.image_urls]);

  const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
            {report.status.replace('_', ' ').toUpperCase()}
          </span>
          {report.priority && (
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
              {report.priority.toUpperCase()}
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          ID: RPT-{report.id?.toString().padStart(4, '0')}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Images */}
        {imageUrls.length > 0 && (
          <div className="relative">
            <img
              src={`${baseURL}${imageUrls[0]}`}
              alt={report.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              <Camera className="w-3 h-3 inline mr-1" />
              {imageUrls.length} photo{imageUrls.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{report.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{report.description || 'No description provided'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{report.votes || 0}</div>
              <div className="text-xs text-blue-600">Community Votes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">{report.urgency_score || 'N/A'}</div>
              <div className="text-xs text-green-600">Urgency Score</div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-gray-900">
              <MapPin className="w-4 h-4 text-blue-600" />
              Location
            </h4>
            <p className="text-sm text-gray-600 ml-6">{report.address || 'Location not specified'}</p>
            {report.latitude && report.longitude && (
              <p className="text-xs text-gray-500 ml-6">
                Coordinates: {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}
              </p>
            )}
          </div>

          {/* Reporter Info */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-gray-900">
              <User className="w-4 h-4 text-blue-600" />
              Reporter Information
            </h4>
            <div className="ml-6 space-y-1">
              <p className="text-sm font-medium text-gray-800">{report.user_name || 'Anonymous'}</p>
              {report.user_phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{report.user_phone}</span>
                </div>
              )}
              {report.user_email && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span>{report.user_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-gray-900">
              <Building2 className="w-4 h-4 text-blue-600" />
              Category
            </h4>
            <div className="ml-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {departments.find(d => d.id === report.category)?.name || report.category}
              </span>
            </div>
          </div>

          {/* Audio */}
          {report.audio_url && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-gray-900">
                <Mic className="w-4 h-4 text-blue-600" />
                Voice Note
              </h4>
              <div className="ml-6">
                <audio controls className="w-full">
                  <source src={`${baseURL}${report.audio_url}`} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-gray-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              Reported
            </h4>
            <div className="ml-6">
              <p className="text-sm text-gray-800 font-medium">
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(report.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} • {Math.floor((new Date() - new Date(report.created_at)) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          {report.status === 'new' && (
            <>
              <button
                onClick={() => onStatusUpdate(report.id, 'acknowledged')}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Acknowledge Report
              </button>
              <button
                onClick={() => onStatusUpdate(report.id, 'in_progress')}
                className="w-full bg-yellow-600 text-white py-2.5 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
              >
                Start Working
              </button>
            </>
          )}
          
          {report.status === 'acknowledged' && (
            <button
              onClick={() => onStatusUpdate(report.id, 'in_progress')}
              className="w-full bg-yellow-600 text-white py-2.5 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
            >
              Start Working
            </button>
          )}
          
          {(report.status === 'in_progress' || report.status === 'acknowledged') && (
            <button
              onClick={() => onStatusUpdate(report.id, 'resolved')}
              className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Mark as Resolved
            </button>
          )}
          
          {report.status === 'resolved' && (
            <div className="w-full bg-green-100 text-green-800 py-2.5 px-4 rounded-lg text-center font-medium text-sm border border-green-200">
              ✓ Report Resolved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced List View Component
const ListView = ({ reports, onReportSelect, selectedReport }) => {
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-100 text-red-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'acknowledged': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

  const getFirstImageUrl = (imageUrls) => {
    if (!imageUrls) return null;
    try {
      const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      return urls.length > 0 ? `${baseURL}${urls[0]}` : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2">
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500">Try adjusting your search or department filters.</p>
        </div>
      ) : (
        reports.map((report) => {
          const imageUrl = getFirstImageUrl(report.image_urls);
          return (
            <div
              key={report.id}
              onClick={() => onReportSelect(report)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedReport?.id === report.id ? 'border-blue-500 shadow-md ring-1 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex gap-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={report.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%23e5e7eb"%3E%3Crect width="64" height="64"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {report.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.address || 'Location not specified'}
                    </span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.audio_url && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                      <Mic className="w-3 h-3" />
                      <span>Voice note attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// Main Dashboard Component
const CivicAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0, critical: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from real API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/dashboard');
      if (response.success) {
        setReports(response.data.reports);
        setStats(response.data.stats);
      } else {
        throw new Error(response.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load dashboard data. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesDepartment = selectedDepartment === 'all' || report.category === selectedDepartment;
      const matchesSearch = searchTerm === '' ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.address && report.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.user_name && report.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesDepartment && matchesSearch;
    });
  }, [reports, selectedDepartment, searchTerm]);

  // Handle status update
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}`, { status: newStatus });
      if (response.success) {
        setReports(prev => prev.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        ));
        if (selectedReport?.id === reportId) {
          setSelectedReport(prev => ({ ...prev, status: newStatus }));
        }
        // Refresh stats
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update report status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching reports from database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${
        sidebarOpen ? 'w-80' : 'w-16'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-gray-900">Civic Portal</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-red-700">{stats.new}</div>
                  <div className="text-xs text-red-600">New</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">{stats.in_progress}</div>
                  <div className="text-xs text-yellow-600">In Progress</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-700">{stats.resolved}</div>
                  <div className="text-xs text-green-600">Resolved</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{stats.total}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
              </div>
            </div>

            {/* Departments */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Departments</h3>
              <div className="space-y-1">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  const count = dept.id === 'all' ? reports.length : reports.filter(r => r.category === dept.id).length;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedDepartment === dept.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-sm font-medium">{dept.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedDepartment === dept.id 
                          ? 'bg-blue-200 text-blue-800' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDepartment === 'all' ? 'All Reports' : departments.find(d => d.id === selectedDepartment)?.name}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredReports.length} of {reports.length} reports
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Map View"
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button 
                onClick={fetchData}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 relative">
                <Bell className="w-5 h-5" />
                {stats.new > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.new}
                  </span>
                )}
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 p-4 overflow-hidden">
            {viewMode === 'map' ? (
              <MapView
                reports={filteredReports}
                selectedReport={selectedReport}
                onReportSelect={setSelectedReport}
              />
            ) : (
              <ListView
                reports={filteredReports}
                onReportSelect={setSelectedReport}
                selectedReport={selectedReport}
              />
            )}
          </div>

          {/* Detail Panel */}
          {selectedReport && (
            <div className="w-96 border-l border-gray-200 bg-white overflow-hidden">
              <ReportDetailPanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CivicAdminDashboard;