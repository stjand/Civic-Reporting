// File: AdminDashboard.jsx - Refactored Version

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, MapPin, Calendar, User, Construction, Trash2, Lightbulb, 
  Droplets, CheckCircle, Clock, AlertTriangle, BarChart3, Filter, 
  Search, X, Building2, Zap, Bell, Settings, LogOut, FileText, 
  Image, Send, Home, Users, Activity, TrendingUp, RefreshCw, 
  ChevronDown, UserCircle, Eye, Download, Plus, Minus, Menu,
  ExternalLink, Star, MessageSquare, Maximize2
} from 'lucide-react';
import MapPicker from './MapPicker'; // Import the MapPicker component

// Mock data (moved outside component for performance)
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
      { message: 'Cleanup crew dispatched to location', timestamp: '2024-01-20T09:00:00Z', officer: 'Sanitation Team' }
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
      { message: 'Issue resolved - new LED lights installed', timestamp: '2024-01-19T16:00:00Z', officer: 'Electrical Department' }
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
];

// Official profile
const officialProfile = {
  name: "Dr. Sarah Johnson",
  designation: "Municipal Administrator", 
  department: "City Government",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c8b8?w=150&h=150&fit=crop&crop=face"
};

// Departments
const departments = [
  { id: 'all', name: 'All Departments', icon: Building2, color: 'indigo', count: 0 },
  { id: 'municipal', name: 'Municipal Services', icon: Building2, color: 'blue', count: 0 },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'yellow', count: 0 },
  { id: 'roads', name: 'Roads & Infrastructure', icon: Construction, color: 'orange', count: 0 },
  { id: 'sanitation', name: 'Sanitation', icon: Trash2, color: 'green', count: 0 },
  { id: 'water', name: 'Water & Drainage', icon: Droplets, color: 'cyan', count: 0 }
];

const getStatusStyles = (status) => {
  const styles = {
    'new': 'bg-red-50 text-red-700 border-red-200',
    'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'resolved': 'bg-green-50 text-green-700 border-green-200'
  };
  return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getPriorityStyles = (priority) => {
  const styles = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800', 
    'low': 'bg-green-100 text-green-800'
  };
  return styles[priority] || 'bg-gray-100 text-gray-800';
};

const ModernAdminDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
      const newCount = mockReports.filter(r => r.status === 'new').length;
      const inProgressCount = mockReports.filter(r => r.status === 'in_progress').length;
      const resolvedCount = mockReports.filter(r => r.status === 'resolved').length;

      setStats({
        total: mockReports.length,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      });
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredReports = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return [];
    return reports.filter(report => {
      if (!report) return false;
      const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment;
      const matchesSearch = searchTerm === '' || 
        (report.title && report.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.address && report.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesDepartment && matchesSearch && matchesStatus;
    });
  }, [reports, selectedDepartment, searchTerm, statusFilter]);

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching the latest civic reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Civic Dashboard</h1>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed lg:relative lg:translate-x-0 z-30 w-80 h-screen bg-white shadow-xl 
          transition-transform duration-300 ease-in-out flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Civic Dashboard</h1>
                  <p className="text-xs text-gray-500">Administrator Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <img
                src={officialProfile.avatar}
                alt={officialProfile.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{officialProfile.name}</p>
                <p className="text-sm text-gray-600 truncate">{officialProfile.designation}</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Reports Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-700">{stats.new}</p>
                    <p className="text-xs text-red-600 font-medium">New</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
                    <p className="text-xs text-blue-600 font-medium">In Progress</p>
                  </div>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                    <p className="text-xs text-green-600 font-medium">Resolved</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-indigo-700">{stats.total}</p>
                    <p className="text-xs text-indigo-600 font-medium">Total</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Departments
            </h3>
            <div className="space-y-2 mb-6">
              {departments.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDepartment === dept.id;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left 
                      transition-all duration-200 ${isSelected
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="flex-1 text-sm font-medium">{dept.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isSelected 
                      ? 'bg-indigo-200 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600'}`}>
                      {dept.id === 'all' ? stats.total : 
                       reports.filter(r => r.department === dept.id).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Status Filter
            </h3>
            <div className="space-y-2">
              {[
                { id: 'all', name: 'All Reports', icon: BarChart3 },
                { id: 'new', name: 'New', icon: AlertTriangle },
                { id: 'in_progress', name: 'In Progress', icon: Clock },
                { id: 'resolved', name: 'Resolved', icon: CheckCircle }
              ].map((status) => {
                const Icon = status.icon;
                const isSelected = statusFilter === status.id;
                return (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left 
                      transition-all duration-200 ${isSelected
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">{status.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl 
                      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                      bg-gray-50 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'map'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>

                <button className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                  transition-colors shadow-sm">
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                  transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredReports.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{reports.length}</span> reports
              </p>
              <p className="text-xs text-gray-500">Last updated 2 minutes ago</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Reports List */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Reports</h2>
                  <span className="text-sm text-gray-500">
                    {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
                  </span>
                </div>

                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all 
                        duration-200 hover:shadow-lg ${selectedReport?.id === report.id
                          ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-100'
                          : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={report.image_urls[0]}
                            alt={report.title}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight 
                              truncate pr-2">
                              {report.title}
                            </h3>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full 
                                ${getPriorityStyles(report.priority)}`}>
                                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                              </span>
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                                ${getStatusStyles(report.status)}`}>
                                {report.status.replace('_', ' ').charAt(0).toUpperCase() + 
                                 report.status.replace('_', ' ').slice(1)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {report.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-32">{report.address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{report.user_name}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel */}
              <div className="space-y-6">
                {/* Map View */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location Map</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Maximize2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="map-container rounded-xl overflow-hidden h-64">
                    <MapPicker 
                      initialLocation={selectedReport?.location || { lat: 12.9716, lng: 77.5946 }} 
                      onLocationSelect={() => {}} 
                    />
                  </div>
                </div>

                {/* Selected Report Details */}
                {selectedReport && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                        <button
                          onClick={() => setSelectedReport(null)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <img
                          src={selectedReport.image_urls[0]}
                          alt={selectedReport.title}
                          className="w-full h-32 rounded-xl object-cover border border-gray-200"
                        />

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {selectedReport.title}
                          </h4>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full 
                              ${getPriorityStyles(selectedReport.priority)}`}>
                              {selectedReport.priority.charAt(0).toUpperCase() + selectedReport.priority.slice(1)} Priority
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                              ${getStatusStyles(selectedReport.status)}`}>
                              {selectedReport.status.replace('_', ' ').charAt(0).toUpperCase() + 
                               selectedReport.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedReport.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedReport.address}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Reported by {selectedReport.user_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(selectedReport.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          {selectedReport.status !== 'resolved' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(selectedReport.id, 'in_progress')}
                                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2.5 
                                  rounded-xl hover:bg-blue-700 transition-colors"
                              >
                                Start Progress
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                                className="flex-1 bg-green-600 text-white text-sm font-medium py-2.5 
                                  rounded-xl hover:bg-green-700 transition-colors"
                              >
                                Mark Resolved
                              </button>
                            </>
                          )}
                          {selectedReport.status === 'resolved' && (
                            <div className="flex-1 bg-green-50 text-green-700 text-sm font-medium 
                              py-2.5 rounded-xl text-center border border-green-200">
                              ✓ Resolved
                            </div>
                          )}
                        </div>

                        {selectedReport.updates && selectedReport.updates.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">Updates</h5>
                            <div className="space-y-3">
                              {selectedReport.updates.map((update, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-sm text-gray-700 mb-1">{update.message}</p>
                                  <p className="text-xs text-gray-500">
                                    {update.officer} • {new Date(update.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;