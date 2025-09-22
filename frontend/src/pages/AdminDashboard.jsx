import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Search, Menu, List, Map, Filter, Bell, User, Settings,
  X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock,
  CheckCircle, AlertTriangle, Construction, Droplets, Zap, Trash2,
  Building2, Users, Shield, Eye, MessageSquare, Flag, RefreshCw,
  Navigation, Layers, Plus, Minus, Home, BarChart3
} from 'lucide-react';

// Mock API client
const apiClient = {
  get: async (endpoint) => {
    // Mock data for demonstration
    const mockReports = [
      {
        id: 1,
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues",
        category: "roads",
        status: "new",
        priority: "high",
        latitude: 17.4239,
        longitude: 78.4738,
        address: "Main Street, Hyderabad",
        user_name: "John Doe",
        user_phone: "+91 9876543210",
        user_email: "john@email.com",
        created_at: "2024-01-15T10:30:00Z",
        image_urls: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
        votes: 24,
        affected_people: 150
      },
      {
        id: 2,
        title: "Water Leak Emergency",
        description: "Major water pipe burst near residential area",
        category: "water",
        status: "in_progress",
        priority: "critical",
        latitude: 17.4339,
        longitude: 78.4838,
        address: "Park Avenue, Hyderabad",
        user_name: "Jane Smith",
        user_phone: "+91 9876543211",
        user_email: "jane@email.com",
        created_at: "2024-01-14T15:45:00Z",
        image_urls: ["https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400"],
        votes: 56,
        affected_people: 300
      },
      {
        id: 3,
        title: "Street Light Not Working",
        description: "Multiple street lights are out on this road",
        category: "electrical",
        status: "resolved",
        priority: "medium",
        latitude: 17.4139,
        longitude: 78.4638,
        address: "Tech Park Road, Hyderabad",
        user_name: "Mike Johnson",
        user_phone: "+91 9876543212",
        user_email: "mike@email.com",
        created_at: "2024-01-13T09:20:00Z",
        image_urls: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
        votes: 12,
        affected_people: 50
      }
    ];

    const stats = {
      total: mockReports.length,
      new: mockReports.filter(r => r.status === 'new').length,
      in_progress: mockReports.filter(r => r.status === 'in_progress').length,
      resolved: mockReports.filter(r => r.status === 'resolved').length,
      critical: mockReports.filter(r => r.priority === 'critical').length
    };

    return { success: true, data: { reports: mockReports, stats } };
  },
  patch: async (endpoint, data) => {
    return { success: true };
  }
};

// Department configurations
const departments = [
  { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-gray-600' },
  { id: 'roads', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-600' },
  { id: 'water', name: 'Water & Drainage', icon: Droplets, color: 'bg-blue-600' },
  { id: 'electrical', name: 'Electrical Services', icon: Zap, color: 'bg-yellow-600' },
  { id: 'sanitation', name: 'Sanitation', icon: Trash2, color: 'bg-green-600' },
  { id: 'municipal', name: 'Municipal Services', icon: Building2, color: 'bg-indigo-600' }
];

// Map Component
const MapView = ({ reports, selectedReport, onReportSelect }) => {
  const [mapZoom, setMapZoom] = useState(1);

  const getMarkerColor = (status) => {
    const colors = {
      'new': 'bg-red-500',
      'in_progress': 'bg-yellow-500',
      'resolved': 'bg-green-500',
      'acknowledged': 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Background */}
      <div 
        className="w-full h-full relative"
        style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(#cbd5e1 1px, transparent 1px),
              linear-gradient(90deg, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Mock Roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-400"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gray-400"></div>
          <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-gray-400"></div>
        </div>

        {/* Report Markers */}
        {reports.map((report, index) => {
          const positions = [
            { top: '25%', left: '30%' },
            { top: '45%', left: '60%' },
            { top: '35%', left: '20%' },
            { top: '65%', left: '75%' },
            { top: '55%', left: '40%' }
          ];
          const position = positions[index % positions.length];
          const isSelected = selectedReport?.id === report.id;

          return (
            <button
              key={report.id}
              onClick={() => onReportSelect(report)}
              className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 hover:scale-110 ${
                isSelected ? 'z-20 scale-110' : 'z-10'
              }`}
              style={position}
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg ${getMarkerColor(report.status)} flex items-center justify-center`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white animate-ping"></div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap max-w-32 truncate">
                    {report.title}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 2))}
          className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.5))}
          className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
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
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Detail Panel
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

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Report Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
            {report.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
            {report.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        {report.image_urls && report.image_urls[0] && (
          <div className="relative">
            <img
              src={report.image_urls[0]}
              alt={report.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{report.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{report.votes}</div>
              <div className="text-xs text-gray-500">Community Votes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{report.affected_people}</div>
              <div className="text-xs text-gray-500">People Affected</div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Location
            </h4>
            <p className="text-sm text-gray-600 ml-6">{report.address}</p>
          </div>

          {/* Reporter Info */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Reporter
            </h4>
            <div className="ml-6 space-y-1">
              <p className="text-sm font-medium">{report.user_name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{report.user_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="w-3 h-3" />
                <span>{report.user_email}</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Reported
            </h4>
            <p className="text-sm text-gray-600 ml-6">
              {new Date(report.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {report.status === 'new' && (
            <>
              <button
                onClick={() => onStatusUpdate(report.id, 'acknowledged')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Acknowledge Report
              </button>
              <button
                onClick={() => onStatusUpdate(report.id, 'in_progress')}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Start Working
              </button>
            </>
          )}
          
          {report.status === 'acknowledged' && (
            <button
              onClick={() => onStatusUpdate(report.id, 'in_progress')}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Start Working
            </button>
          )}
          
          {(report.status === 'in_progress' || report.status === 'acknowledged') && (
            <button
              onClick={() => onStatusUpdate(report.id, 'resolved')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Mark as Resolved
            </button>
          )}
          
          {report.status === 'resolved' && (
            <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-center font-medium">
              ✓ Report Resolved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// List View Component
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

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {reports.map((report) => (
        <div
          key={report.id}
          onClick={() => onReportSelect(report)}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedReport?.id === report.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
          }`}
        >
          <div className="flex gap-4">
            <img
              src={report.image_urls[0]}
              alt={report.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate pr-2">{report.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getStatusColor(report.status)}`}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {report.address}
                </span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
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

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        if (response.success) {
          setReports(response.data.reports);
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesDepartment = selectedDepartment === 'all' || report.category === selectedDepartment;
      const matchesSearch = searchTerm === '' ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesSearch;
    });
  }, [reports, selectedDepartment, searchTerm]);

  // Handle status update
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await apiClient.patch(`/reports/${reportId}`, { status: newStatus });
      setReports(prev => prev.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-16'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
              className="p-1 hover:bg-gray-100 rounded"
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
            <div className="p-4">
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
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-sm">{dept.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {selectedDepartment === 'all' ? 'All Reports' : departments.find(d => d.id === selectedDepartment)?.name}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredReports.length} reports
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 p-4">
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
            <div className="w-96 p-4 border-l border-gray-200">
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