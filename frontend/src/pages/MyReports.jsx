import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  X,
  MapPin,
  Calendar,
  ArrowLeft,
  Shield,
  User,
  Bell,
  Image as ImageIcon,
  Mic,
  ChevronDown,
  ExternalLink,
  Clock,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyReports } from '../services/apiServices';

const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const MyReports = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportsData = await getMyReports();
      setReports(reportsData.reports);
    } catch (err) {
      setError(err.error || 'Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusConfig = (status) => {
    const configs = {
      resolved: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Resolved'
      },
      in_progress: {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'In Progress'
      },
      acknowledged: {
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Acknowledged'
      },
      new: {
        color: 'text-slate-700',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
        label: 'New'
      }
    };
    return configs[status?.toLowerCase()] || configs.new;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRelative = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.report_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status?.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/citizen')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">My Reports</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative" aria-label="Notifications">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <button
                onClick={logout}
                className="hidden sm:block px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-slate-200 mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="new">New</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setSortBy('newest');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports List */}
        {sortedReports.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports found</h3>
            <p className="text-sm text-slate-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters.'
                : 'You haven\'t submitted any reports yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => {
              const statusConfig = getStatusConfig(report.status);
              return (
                <div 
                  key={report.report_id} 
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0 relative">
                      {report.photo_url ? (
                        <img 
                          src={report.photo_url} 
                          alt={report.report_type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      {report.audio_url && (
                        <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
                          <Mic className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 text-base">
                              {report.report_type}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`}></span>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {formatDateRelative(report.created_at)}
                        </span>
                        <span className="flex items-center font-mono">
                          ID: {report.report_id.slice(0, 8)}
                        </span>
                        {report.latitude && report.longitude && (
                          <span className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            <MapPin className="w-3 h-3 mr-1" />
                            Location
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-lg font-bold text-slate-900 truncate">Report Details</h2>
                <p className="text-sm text-slate-500 font-mono">{selectedReport.report_id}</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              {selectedReport.photo_url && (
                <div className="w-full bg-slate-100">
                  <img 
                    src={selectedReport.photo_url} 
                    alt={selectedReport.report_type}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-6">
                {/* Status Badge */}
                {(() => {
                  const statusConfig = getStatusConfig(selectedReport.status);
                  return (
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-2`}></span>
                      <span className="font-semibold text-sm">{statusConfig.label}</span>
                    </div>
                  );
                })()}

                {/* Report Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Report Type</label>
                  <p className="text-lg font-semibold text-slate-900">{selectedReport.report_type}</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
                  <p className="text-slate-700 leading-relaxed">{selectedReport.description}</p>
                </div>

                {/* Audio */}
                {selectedReport.audio_url && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Audio Recording</label>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <audio controls src={selectedReport.audio_url} className="w-full" />
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedReport.latitude && selectedReport.longitude && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Location</label>
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <MapPin className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
                        >
                          View on Google Maps
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Submitted On</label>
                    <div className="flex items-center space-x-2 text-slate-900">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{formatDate(selectedReport.created_at)}</span>
                    </div>
                  </div>
                  {selectedReport.updated_at && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Last Updated</label>
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{formatDate(selectedReport.updated_at)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Response */}
                {selectedReport.admin_response && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Official Response</label>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedReport.admin_response}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;