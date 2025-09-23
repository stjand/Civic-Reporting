import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Search, Menu, List, Map, Filter, Bell, User, Settings,
  X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock,
  CheckCircle, AlertTriangle, Construction, Droplets, Zap, Trash2,
  Building2, Users, Shield, Eye, MessageSquare, Flag, RefreshCw,
  Navigation, Layers, Plus, Minus, Home, BarChart3, Mic, Camera,
  LogOut, ArrowLeft, ChevronDown, MapPinIcon, UserIcon
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

// Department configurations
const departments = [
  { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-gray-600' },
  { id: 'pothole', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-600' },
  { id: 'water_leak', name: 'Water & Drainage', icon: Droplets, color: 'bg-blue-600' },
  { id: 'streetlight', name: 'Street Lighting', icon: Zap, color: 'bg-yellow-600' },
  { id: 'garbage', name: 'Waste Management', icon: Trash2, color: 'bg-green-600' },
  { id: 'other', name: 'Other Issues', icon: Building2, color: 'bg-indigo-600' }
];

// Enhanced Map Component
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

// Enhanced Report Detail Panel - Completely redesigned
const ReportDetailPanel = ({ report, onClose, onStatusUpdate, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  if (!report) return null;

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-500 text-white',
      'in_progress': 'bg-yellow-500 text-white',
      'resolved': 'bg-green-500 text-white',
      'acknowledged': 'bg-blue-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'text-red-600 bg-red-50 border-red-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'low': 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Parse image URLs
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
    <div className={`bg-white shadow-xl border-l border-gray-200 flex flex-col ${
      isMobile 
        ? 'fixed inset-0 z-50' 
        : 'w-full max-w-lg max-h-full'
    }`}>
      {/* Header */}
      <div className="relative">
        {/* Hero Image or Gradient */}
        {imageUrls.length > 0 ? (
          <div className="relative h-48 bg-gray-900">
            <img
              src={`${baseURL}${imageUrls[0]}`}
              alt={report.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {imageUrls.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                +{imageUrls.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600" />
        )}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          {isMobile ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${getStatusColor(report.status)}`}>
            {report.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Report Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-xl font-bold mb-1 line-clamp-2">{report.title}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(report.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {report.address ? report.address.split(',')[0] : 'Location'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex">
          {['details', 'media', 'actions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'media' && imageUrls.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {imageUrls.length}
                </span>
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {report.description || 'No description provided'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{report.votes || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Community Votes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{report.urgency_score || 'N/A'}</div>
                <div className="text-xs text-orange-600 font-medium">Urgency Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((new Date() - new Date(report.created_at)) / (1000 * 60 * 60 * 24))}d
                </div>
                <div className="text-xs text-green-600 font-medium">Days Old</div>
              </div>
            </div>

            {/* Priority Badge */}
            {report.priority && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                  {report.priority.toUpperCase()}
                </span>
              </div>
            )}

            {/* Location Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-blue-600" />
                Location Details
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-gray-800 font-medium">
                  {report.address || 'Location not specified'}
                </p>
                {report.latitude && report.longitude && (
                  <p className="text-xs text-gray-500">
                    Coordinates: {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Reporter Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Reporter Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.user_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">Reporter</p>
                  </div>
                </div>
                
                {(report.user_phone || report.user_email) && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    {report.user_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{report.user_phone}</span>
                      </div>
                    )}
                    {report.user_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{report.user_email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Category
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-800">
                  {departments.find(d => d.id === report.category)?.name || report.category}
                </span>
              </div>
            </div>

            {/* Audio */}
            {report.audio_url && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-blue-600" />
                  Voice Note
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <audio controls className="w-full">
                    <source src={`${baseURL}${report.audio_url}`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Report ID */}
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Report ID: <span className="font-mono font-medium">RPT-{report.id?.toString().padStart(4, '0')}</span>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-6">
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`${baseURL}${url}`}
                      alt={`Report image ${index + 1}`}
                      className="w-full rounded-xl object-cover aspect-video"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No images attached to this report</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            
            {report.status === 'new' && (
              <div className="space-y-3">
                <button
                  onClick={() => onStatusUpdate(report.id, 'acknowledged')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Acknowledge Report
                </button>
                <button
                  onClick={() => onStatusUpdate(report.id, 'in_progress')}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded-xl hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Construction className="w-4 h-4" />
                  Start Working
                </button>
              </div>
            )}
            
            {report.status === 'acknowledged' && (
              <button
                onClick={() => onStatusUpdate(report.id, 'in_progress')}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-xl hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Construction className="w-4 h-4" />
                Start Working
              </button>
            )}
            
            {(report.status === 'in_progress' || report.status === 'acknowledged') && (
              <button
                onClick={() => onStatusUpdate(report.id, 'resolved')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </button>
            )}
            
            {report.status === 'resolved' && (
              <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-xl text-center font-medium border border-green-200 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Report Resolved
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Status changes are permanent and will notify the reporter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced List View Component
const ListView = ({ reports, onReportSelect, selectedReport }) => {
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-red-100 text-red-800 border-red-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'acknowledged': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedReport?.id === report.id ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200'
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
                    <h3 className="font-semibold text-gray-900 line-clamp-1 pr-2">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 font-medium border ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {report.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.address ? report.address.split(',')[0] : 'Location not specified'}
                    </span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {report.audio_url && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Mic className="w-3 h-3" />
                        <span>Audio</span>
                      </div>
                    )}
                    {report.votes > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Users className="w-3 h-3" />
                        <span>{report.votes} votes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// Login Page Component
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@example.com' && password === 'password123') {
      onLogin();
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-600">
            Sign in to manage civic reports
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg"
          >
            Sign in
          </button>
        </form>
        
        {/* Demo credentials */}
        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <p className="text-sm font-medium text-gray-700 mb-2 text-center">
            Demo Credentials
          </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const CivicAdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0, critical: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from API
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
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

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
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update report status. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedReport(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

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
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${
        sidebarOpen ? (isMobile ? 'fixed left-0 top-0 bottom-0 w-80 z-50' : 'w-80') : 'w-0 overflow-hidden'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Civic Portal</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Departments */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Departments</h3>
            <div className="space-y-2">
              {departments.map((dept) => {
                const Icon = dept.icon;
                const count = dept.id === 'all' ? reports.length : reports.filter(r => r.category === dept.id).length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      selectedDepartment === dept.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{dept.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedDepartment === dept.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats at bottom */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <div className="text-lg font-bold text-red-600">{stats.new}</div>
                <div className="text-xs text-red-600 font-medium">New Reports</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">{stats.in_progress}</div>
                <div className="text-xs text-yellow-600 font-medium">In Progress</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-lg font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-green-600 font-medium">Resolved</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-blue-600 font-medium">Total Reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 flex-1">
              {selectedDepartment === 'all' ? 'All Reports' : departments.find(d => d.id === selectedDepartment)?.name}
            </h2>
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
              <button 
                onClick={fetchData}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Refresh"
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
              <button 
                onClick={handleLogout}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by title, location, or reporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2.5 rounded-xl whitespace-nowrap">
              {filteredReports.length} of {reports.length}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className={`flex-1 p-4 overflow-hidden ${selectedReport && !isMobile ? 'mr-0' : ''}`}>
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

          {/* Detail Panel - Desktop */}
          {selectedReport && !isMobile && (
            <div className="w-96 border-l border-gray-200 bg-white overflow-hidden">
              <ReportDetailPanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onStatusUpdate={handleStatusUpdate}
                isMobile={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel - Mobile (Full Screen Modal) */}
      {selectedReport && isMobile && (
        <ReportDetailPanel
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
          isMobile={true}
        />
      )}
    </div>
  );
};

export default CivicAdminDashboard;