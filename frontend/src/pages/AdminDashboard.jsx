// File: modern-admin-dashboard.tsx (Completed and Enhanced Version)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, MapPin, Calendar, User, Construction, Trash2,
  Droplets, CheckCircle, Clock, AlertTriangle, BarChart3, Filter,
  Search, X, Building2, Zap, Bell, Settings, Menu, Grid3X3,
  Users, Activity, TrendingUp, RefreshCw, Eye, Download,
  MessageSquare, Phone, Mail, FileText, Camera, Send,
  ChevronRight, Star, ThumbsUp, Flag, ExternalLink,
  PlayCircle, Pause, RotateCcw, AlertCircle, Map, List,
  Home, UserCircle, Maximize2, Edit, Plus, Minus
} from 'lucide-react';

// Mock data with more comprehensive details
const mockReports = [
  {
    id: 1,
    title: 'Major pothole causing traffic disruption',
    description: 'Large pothole on Main Street intersection causing significant traffic delays and vehicle damage. Multiple complaints received from commuters. Urgent repair needed to prevent accidents and further road deterioration.',
    category: 'pothole',
    department: 'roads',
    status: 'new',
    priority: 'critical',
    urgency_score: 9,
    location: { lat: 12.9716, lng: 77.5946 },
    address: 'Main Street & 5th Avenue Intersection, Downtown District',
    user_name: 'John Smith',
    user_phone: '+91 98765 43210',
    user_email: 'john.smith@email.com',
    created_at: '2024-01-20T10:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    estimated_cost: '₹25,000',
    estimated_duration: '2-3 days',
    affected_people: 500,
    votes: 24,
    updates: []
  },
  {
    id: 2,
    title: 'Overflowing garbage containers in residential area',
    description: 'Multiple waste bins overflowing in Oak Avenue residential complex. Creating health hazards and attracting pests. Residents complaining of foul smell and unhygienic conditions.',
    category: 'garbage',
    department: 'sanitation',
    status: 'in_progress',
    priority: 'medium',
    urgency_score: 6,
    location: { lat: 12.9652, lng: 77.6045 },
    address: 'Oak Avenue Residential Complex, Block A-C',
    user_name: 'Maria Garcia',
    user_phone: '+91 87654 32109',
    user_email: 'maria.garcia@email.com',
    created_at: '2024-01-19T14:45:00Z',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop',
    estimated_cost: '₹8,000',
    estimated_duration: '1 day',
    affected_people: 150,
    votes: 12,
    updates: [
      { message: 'Cleanup crew dispatched to location. Expected completion by evening.', timestamp: '2024-01-20T09:00:00Z', officer: 'Sanitation Team Lead' }
    ]
  },
  {
    id: 3,
    title: 'Street light malfunction causing safety concerns',
    description: 'Non-functional street lighting on Pine Street creating safety concerns for residents, especially during night hours. Multiple lights not working for past week.',
    category: 'streetlight',
    department: 'electrical',
    status: 'resolved',
    priority: 'medium',
    urgency_score: 5,
    location: { lat: 12.9779, lng: 77.5871 },
    address: 'Pine Street, Sector 15, Suburb Area',
    user_name: 'David Wilson',
    user_phone: '+91 76543 21098',
    user_email: 'david.wilson@email.com',
    created_at: '2024-01-18T20:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=600&h=400&fit=crop',
    estimated_cost: '₹15,000',
    estimated_duration: '1 day',
    affected_people: 200,
    votes: 18,
    updates: [
      { message: 'Issue resolved - new LED lights installed. Testing completed successfully.', timestamp: '2024-01-19T16:00:00Z', officer: 'Electrical Department' }
    ]
  },
  {
    id: 4,
    title: 'Water pipe burst causing flooding',
    description: 'Major pipeline burst on Elm Street causing severe flooding and traffic disruption. Water supply affected in surrounding areas. Emergency repair required.',
    category: 'water_leak',
    department: 'water',
    status: 'new',
    priority: 'critical',
    urgency_score: 10,
    location: { lat: 12.9598, lng: 77.6097 },
    address: 'Elm Street Commercial District, Near Metro Station',
    user_name: 'Lisa Brown',
    user_phone: '+91 65432 10987',
    user_email: 'lisa.brown@email.com',
    created_at: '2024-01-21T08:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop',
    estimated_cost: '₹50,000',
    estimated_duration: '3-5 days',
    affected_people: 1200,
    votes: 45,
    updates: []
  },
  {
    id: 5,
    title: 'Park maintenance required urgently',
    description: 'City park equipment damaged and unsafe. Swings broken, benches vandalized, and walking paths have potholes. Children safety at risk.',
    category: 'park',
    department: 'parks',
    status: 'new',
    priority: 'high',
    urgency_score: 7,
    location: { lat: 12.9800, lng: 77.5950 },
    address: 'Central Park, Green Valley Colony',
    user_name: 'Robert Chen',
    user_phone: '+91 54321 09876',
    user_email: 'robert.chen@email.com',
    created_at: '2024-01-20T16:20:00Z',
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    estimated_cost: '₹35,000',
    estimated_duration: '1 week',
    affected_people: 300,
    votes: 8,
    updates: []
  },
  {
    id: 6,
    title: 'Traffic signal malfunction at busy intersection',
    description: 'Traffic lights not functioning properly at the main commercial intersection, causing major traffic jams and safety hazards during peak hours.',
    category: 'traffic',
    department: 'traffic',
    status: 'in_progress',
    priority: 'high',
    urgency_score: 8,
    location: { lat: 12.9750, lng: 77.6000 },
    address: 'Commercial Street & Brigade Road Junction',
    user_name: 'Priya Sharma',
    user_phone: '+91 99887 76655',
    user_email: 'priya.sharma@email.com',
    created_at: '2024-01-21T12:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
    estimated_cost: '₹20,000',
    estimated_duration: '2 days',
    affected_people: 800,
    votes: 32,
    updates: [
      { message: 'Traffic control team deployed. Signal repair in progress.', timestamp: '2024-01-21T14:30:00Z', officer: 'Traffic Control Officer' }
    ]
  }
];

// Government departments - YouTube style navigation
const departments = [
  {
    id: 'all',
    name: 'All Departments',
    icon: Grid3X3,
    color: 'bg-slate-600',
    textColor: 'text-slate-600',
    bgHover: 'hover:bg-slate-50',
    description: 'View all civic reports across departments',
    count: 0
  },
  {
    id: 'roads',
    name: 'Roads & Infrastructure',
    icon: Construction,
    color: 'bg-orange-600',
    textColor: 'text-orange-600',
    bgHover: 'hover:bg-orange-50',
    description: 'Road repairs, potholes, traffic signals',
    count: 0
  },
  {
    id: 'water',
    name: 'Water & Drainage',
    icon: Droplets,
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    bgHover: 'hover:bg-blue-50',
    description: 'Water supply, pipe bursts, drainage issues',
    count: 0
  },
  {
    id: 'electrical',
    name: 'Electrical Services',
    icon: Zap,
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    bgHover: 'hover:bg-yellow-50',
    description: 'Street lights, power outages, electrical repairs',
    count: 0
  },
  {
    id: 'sanitation',
    name: 'Sanitation',
    icon: Trash2,
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgHover: 'hover:bg-green-50',
    description: 'Garbage collection, waste management, cleanliness',
    count: 0
  },
  {
    id: 'parks',
    name: 'Parks & Recreation',
    icon: Users,
    color: 'bg-emerald-600',
    textColor: 'text-emerald-600',
    bgHover: 'hover:bg-emerald-50',
    description: 'Parks maintenance, recreational facilities',
    count: 0
  },
  {
    id: 'traffic',
    name: 'Traffic Management',
    icon: AlertCircle,
    color: 'bg-red-600',
    textColor: 'text-red-600',
    bgHover: 'hover:bg-red-50',
    description: 'Traffic signals, road safety, traffic violations',
    count: 0
  },
  {
    id: 'municipal',
    name: 'Municipal Services',
    icon: Building2,
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    bgHover: 'hover:bg-indigo-50',
    description: 'General municipal complaints and services',
    count: 0
  }
];

// Enhanced Interactive Map Component
const InteractiveMap = ({ reports, onReportClick, selectedReport }) => {
  const [mapZoom, setMapZoom] = useState(1);

  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-white/50">
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">{reports.length} Reports</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-white/50 hover:bg-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-white/50 hover:bg-white transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mock Map Background */}
      <div className="w-full h-full relative overflow-hidden" style={{ transform: `scale(${mapZoom})` }}>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300"></div>
          {/* Enhanced grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(#cbd5e1 1px, transparent 1px),
              linear-gradient(90deg, #cbd5e1 1px, transparent 1px),
              linear-gradient(#e2e8f0 1px, transparent 1px),
              linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 10px 10px, 10px 10px'
          }}></div>
        </div>

        {/* Mock roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-400 opacity-60"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1.5 bg-gray-400 opacity-40"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-1.5 bg-gray-400 opacity-50"></div>
          <div className="absolute top-0 bottom-0 right-1/4 w-2 bg-gray-400 opacity-60"></div>
        </div>

        {/* Report Pins with enhanced positioning */}
        {reports.map((report, index) => {
          const isSelected = selectedReport?.id === report.id;
          const positions = [
            { top: '25%', left: '30%' },
            { top: '45%', left: '60%' },
            { top: '35%', left: '75%' },
            { top: '65%', left: '40%' },
            { top: '20%', left: '80%' },
            { top: '70%', left: '25%' },
            { top: '55%', left: '85%' }
          ];
          const position = positions[index % positions.length];

          return (
            <button
              key={report.id}
              onClick={() => onReportClick(report)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 hover:z-30 ${
                isSelected ? 'z-20 scale-110' : 'z-10'
              }`}
              style={position}
            >
              <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                {/* Shadow */}
                <div className="absolute top-1 left-1 w-10 h-10 bg-black/20 rounded-full blur-sm"></div>

                {/* Main pin */}
                <div className={`relative w-10 h-10 rounded-full shadow-lg border-3 border-white flex items-center justify-center transform hover:scale-110 transition-transform ${
                  report.priority === 'critical' ? 'bg-red-500 shadow-red-200' :
                  report.priority === 'high' ? 'bg-orange-500 shadow-orange-200' :
                  report.priority === 'medium' ? 'bg-yellow-500 shadow-yellow-200' : 'bg-green-500 shadow-green-200'
                }`}>
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  </>
                )}

                {/* Priority indicator */}
                <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
                  report.priority === 'critical' ? 'bg-red-600' :
                  report.priority === 'high' ? 'bg-orange-600' :
                  report.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  !
                </div>
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Priority Levels</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              <span className="text-xs text-gray-600">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
              <span className="text-xs text-gray-600">Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/50 hover:bg-white transition-colors group"
        >
          <Plus className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/50 hover:bg-white transition-colors group"
        >
          <Minus className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
        </button>
      </div>
    </div>
  );
};

// Floating Report Panel Component
const FloatingReportPanel = ({ report, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen || !report) return null;

  const getStatusColor = (status) => {
    const colors = {
      'new': 'text-red-700 bg-red-50 border-red-200',
      'in_progress': 'text-blue-700 bg-blue-50 border-blue-200',
      'resolved': 'text-green-700 bg-green-50 border-green-200'
    };
    return colors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'text-red-800 bg-red-100 border-red-300',
      'high': 'text-orange-800 bg-orange-100 border-orange-300',
      'medium': 'text-yellow-800 bg-yellow-100 border-yellow-300',
      'low': 'text-green-800 bg-green-100 border-green-300'
    };
    return colors[priority] || 'text-gray-800 bg-gray-100 border-gray-300';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Report Details</h2>
                    <p className="text-blue-100 text-sm">ID: #{report.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border backdrop-blur-sm ${getPriorityColor(report.priority)}`}>
                  {report.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border backdrop-blur-sm ${getStatusColor(report.status)}`}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-blue-100 text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{report.affected_people} affected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{report.votes} votes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image */}
            <div className="relative">
              <img
                src={report.image_url}
                alt={report.title}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-black/60 text-white px-3 py-2 rounded-full text-sm backdrop-blur-sm flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Evidence Photo</span>
                </div>
                <button className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title and Description */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{report.title}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{report.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center border border-blue-200 hover:shadow-md transition-shadow">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-700 mb-1">{report.affected_people}</div>
                  <div className="text-sm text-blue-600 font-medium">People Affected</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 text-center border border-green-200 hover:shadow-md transition-shadow">
                  <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-700 mb-1">{report.votes}</div>
                  <div className="text-sm text-green-600 font-medium">Community Votes</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 text-center border border-orange-200 hover:shadow-md transition-shadow">
                  <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-700 mb-1">{report.urgency_score}/10</div>
                  <div className="text-sm text-orange-600 font-medium">Urgency Score</div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-5">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                    Location Details
                  </h4>
                  <p className="text-gray-800 mb-2 font-medium">{report.address}</p>
                  <div className="text-sm text-gray-500">
                    Coordinates: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-indigo-600" />
                      Reporter Information
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-800 font-semibold">{report.user_name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{report.user_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{report.user_email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      Timeline Information
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-800 font-semibold">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((new Date() - new Date(report.created_at)) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                    <BarChart3 className="w-5 h-5 mr-3 text-emerald-600" />
                    Project Estimates
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200">
                        <span className="text-2xl">₹</span>
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-gray-900">{report.estimated_cost}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200">
                        <Clock className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-2xl font-bold text-gray-900">{report.estimated_duration}</p>
                    </div>
                  </div>
                </div>

                {/* Department Info */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-amber-600" />
                    Assigned Department
                  </h4>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const dept = departments.find(d => d.id === report.department);
                      const Icon = dept?.icon || Building2;
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dept?.color || 'bg-gray-600'} text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{dept?.name || report.department}</p>
                            <p className="text-sm text-gray-600">{dept?.description || 'Government department'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Updates Section */}
              {report.updates && report.updates.length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                    <Activity className="w-5 h-5 mr-3 text-blue-600" />
                    Recent Updates ({report.updates.length})
                  </h4>
                  <div className="space-y-4">
                    {report.updates.map((update, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-2">{update.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="font-medium">{update.officer}</span>
                              <span>•</span>
                              <span>{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <Phone className="w-5 h-5 mr-3 text-gray-600" />
                  Quick Contact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 group">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Call Reporter</p>
                      <p className="text-xs text-gray-500">{report.user_phone}</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 group">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Send Email</p>
                      <p className="text-xs text-gray-500 truncate">{report.user_email}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
            <div className="space-y-4">
              {/* Status Update Buttons */}
              {report.status === 'new' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onStatusUpdate(report.id, 'in_progress')}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Start Working</span>
                    </button>
                    <button
                      onClick={() => onStatusUpdate(report.id, 'resolved')}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                  <button className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                    <Flag className="w-4 h-4" />
                    <span>Assign to Team</span>
                  </button>
                </div>
              )}

              {report.status === 'in_progress' && (
                <div className="space-y-3">
                  <button
                    onClick={() => onStatusUpdate(report.id, 'resolved')}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark as Resolved</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors">
                      <Pause className="w-4 h-4" />
                      <span>Pause Work</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>Add Update</span>
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'resolved' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 py-4 rounded-2xl text-center font-bold flex items-center justify-center space-x-2">
                    <CheckCircle className="w-6 h-6" />
                    <span>✓ Report Successfully Resolved</span>
                  </div>
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reopen Case</span>
                  </button>
                </div>
              )}

              {/* Additional Actions */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Note</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ModernAdminDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0, critical: 0 });
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReports(mockReports);

      const newCount = mockReports.filter(r => r.status === 'new').length;
      const inProgressCount = mockReports.filter(r => r.status === 'in_progress').length;
      const resolvedCount = mockReports.filter(r => r.status === 'resolved').length;
      const criticalCount = mockReports.filter(r => r.priority === 'critical').length;

      setStats({
        total: mockReports.length,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        critical: criticalCount
      });
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment;
      const matchesSearch = searchTerm === '' ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesSearch;
    });
  }, [reports, selectedDepartment, searchTerm]);

  // Update department counts
  const departmentsWithCounts = useMemo(() => {
    return departments.map(dept => ({
      ...dept,
      count: dept.id === 'all' ? reports.length : reports.filter(r => r.department === dept.id).length
    }));
  }, [reports]);

  // Handle report selection
  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowFloatingPanel(true);
  };

  // Update report status
  const handleStatusUpdate = (reportId, newStatus) => {
    setReports(prev => prev.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }));
    }

    // Update stats
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    );
    const newCount = updatedReports.filter(r => r.status === 'new').length;
    const inProgressCount = updatedReports.filter(r => r.status === 'in_progress').length;
    const resolvedCount = updatedReports.filter(r => r.status === 'resolved').length;
    const criticalCount = updatedReports.filter(r => r.priority === 'critical').length;

    setStats({
      total: updatedReports.length,
      new: newCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      critical: criticalCount
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'text-red-700 bg-red-100 border-red-200',
      'in_progress': 'text-blue-700 bg-blue-100 border-blue-200',
      'resolved': 'text-green-700 bg-green-100 border-green-200'
    };
    return colors[status] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'text-red-800 bg-red-100 border-red-300',
      'high': 'text-orange-800 bg-orange-100 border-orange-300',
      'medium': 'text-yellow-800 bg-yellow-100 border-yellow-300',
      'low': 'text-green-800 bg-green-100 border-green-300'
    };
    return colors[priority] || 'text-gray-800 bg-gray-100 border-gray-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching the latest civic reports...</p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Civic Portal</h1>
                  <p className="text-sm text-gray-500">Administrator Dashboard</p>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports, locations, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm transition-all"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600 shadow-sm'
                    : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'map'
                    ? 'bg-blue-100 text-blue-600 shadow-sm'
                    : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Map className="w-5 h-5" />
                </button>
              </div>

              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.new}</p>
              <p className="text-sm text-gray-500">New Reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Flag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.critical}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Navigation - YouTube Style */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {departmentsWithCounts.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? `${dept.color} text-white shadow-lg transform scale-105`
                    : `${dept.bgHover} ${dept.textColor} hover:shadow-md`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{dept.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {dept.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 h-[calc(100vh-230px)]">
        {viewMode === 'list' ? (
          // List View
          <div className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDepartment === 'all' ? 'All Reports' : departmentsWithCounts.find(d => d.id === selectedDepartment)?.name}
              </h2>
              <p className="text-gray-500">
                Showing {filteredReports.length} of {reports.length} reports
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-4 h-[calc(100%-60px)] custom-scrollbar">
              {filteredReports.length === 0 ? (
                <div className="lg:col-span-2 xl:col-span-3 text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">Try adjusting your search or department filters.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleReportClick(report)}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl cursor-pointer transition-all duration-300 hover:border-blue-300 group"
                  >
                    <div className="space-y-4">
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={report.image_url}
                          alt={report.title}
                          className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(report.priority)}`}>
                            {report.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {report.description}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Votes</p>
                          <p className="font-bold text-lg text-gray-900">{report.votes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Affected</p>
                          <p className="font-bold text-lg text-gray-900">{report.affected_people}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Date</p>
                          <p className="font-bold text-lg text-gray-900">{formatDate(report.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Map View
          <div className="h-full">
            <InteractiveMap
              reports={filteredReports}
              onReportClick={handleReportClick}
              selectedReport={selectedReport}
            />
          </div>
        )}
      </div>

      {/* Floating Report Panel */}
      <FloatingReportPanel
        report={selectedReport}
        isOpen={showFloatingPanel}
        onClose={() => setShowFloatingPanel(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default ModernAdminDashboard;