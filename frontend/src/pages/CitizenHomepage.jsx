import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  CheckSquare, 
  User, 
  PlusCircle,
  BarChart3,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  Bell,
  Activity,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyStats, getMyReports } from '../services/apiServices';

const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const CitizenHomepage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, reportsData] = await Promise.all([
        getMyStats(),
        getMyReports()
      ]);
      
      setStats(statsData.stats);
      setRecentReports(reportsData.reports.slice(0, 3));
    } catch (err) {
      setError(err.error || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Submit New Report',
      description: 'Report a new issue in your community',
      icon: PlusCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/report'
    },
    {
      title: 'My Reports',
      description: 'View and track your submitted reports',
      icon: FileText,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/my-reports'
    },
    {
      title: 'Validate Reports',
      description: 'Help validate community reports',
      icon: CheckSquare,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/validate-reports'
    },
    {
      title: 'My Profile',
      description: 'Manage your account settings',
      icon: User,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      path: '/profile'
    }
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'acknowledged': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CivicReport</h1>
                <p className="text-sm text-gray-500">Citizen Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-lg text-gray-600">
            Thank you for being an active member of our community. Your contributions make a difference.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.reportsSubmitted}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Reports Submitted</h3>
              <p className="text-sm text-gray-600">Total issues reported</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.reportsInProgress}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">In Progress</h3>
              <p className="text-sm text-gray-600">Being worked on</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.reportsResolved}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Issues Resolved</h3>
              <p className="text-sm text-gray-600">Successfully completed</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Activity className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.reportsNew}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Pending</h3>
              <p className="text-sm text-gray-600">Awaiting review</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow group"
                >
                  <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <button
                onClick={() => navigate('/my-reports')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Reports
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentReports.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No reports yet</p>
                <button
                  onClick={() => navigate('/report')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              recentReports.map((report) => (
                <div key={report.report_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{report.report_type}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.report_id}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <button
                        onClick={() => navigate(`/status/${report.report_id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenHomepage;