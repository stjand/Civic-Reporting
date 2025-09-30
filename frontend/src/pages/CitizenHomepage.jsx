// File: CitizenHomepage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  CheckSquare, 
  User, 
  PlusCircle,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  Activity,
  Loader2,
  CheckCircle,
  Bell, // 🟢 CHANGE: New Icon Import
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyStats, getMyReports, getMyNotifications, markNotificationAsRead } from '../services/apiServices'; // 🟢 CHANGE: New Service Imports

const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

// 🟢 NEW COMPONENT: Notification Bell
const NotificationBell = ({ notifications, onMarkAsRead, onNotificationClick }) => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const [isOpen, setIsOpen] = useState(false);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };
    
    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        // 1. Mark as read
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        // 2. Navigate to status page
        if(notification.report_id) {
            navigate(`/status/${notification.report_id}`);
        } else {
             // Optional: just close if no report link
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            
            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right animate-in fade-in-0 zoom-in-95">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Notifications ({unreadCount} new)</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">No recent updates.</p>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`p-3 border-b transition-colors cursor-pointer ${n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <h4 className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-blue-700'}`}>{n.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1 text-right">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {/* Click outside to close */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};

const CitizenHomepage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [notifications, setNotifications] = useState([]); // 🟢 CHANGE: New state for notifications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, reportsData, notificationsData] = await Promise.all([ // 🟢 CHANGE: Fetch notifications
        getMyStats(),
        getMyReports(),
        getMyNotifications(), // 🟢 CHANGE: Call the new service function
      ]);
      
      setStats(statsData.stats);
      setRecentReports(reportsData.reports.slice(0, 3));
      setNotifications(notificationsData.notifications); // 🟢 CHANGE: Set notifications
    } catch (err) {
      setError(err.error || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 🟢 NEW FUNCTION: Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
      try {
          await markNotificationAsRead(notificationId);
          // Optimistically update the state
          setNotifications(prev => prev.map(n => 
              n.id === notificationId ? { ...n, is_read: true } : n
          ));
      } catch (err) {
          console.error("Failed to mark notification as read:", err);
          // If error, re-fetch data for guaranteed consistency
          fetchData();
      }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">CivicReport</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 🟢 CHANGE: Add Notification Bell */}
              <NotificationBell 
                notifications={notifications} 
                onMarkAsRead={handleMarkAsRead}
                onNotificationClick={fetchData} 
              />
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Transform Your Community
          </h1>
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              One Report at a Time
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of citizens making their communities better. Report issues instantly,
            track progress in real-time, and see the meaningful impact of your civic engagement.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/report')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              Submit Report
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => navigate('/my-reports')}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-gray-200 shadow-sm"
            >
              My Reports
            </button>
            <button
              onClick={() => navigate('/validate-reports')}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-gray-200 shadow-sm"
            >
              Validate Reports
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.reportsResolved || 0}</div>
              <div className="text-gray-600">Reports Resolved</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.reportsSubmitted > 0 
                  ? Math.round((stats.reportsResolved / stats.reportsSubmitted) * 100) 
                  : 0}%
              </div>
              <div className="text-gray-600">Resolution Rate</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.reportsInProgress || 0}</div>
              <div className="text-gray-600">In Progress</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.reportsSubmitted || 0}</div>
              <div className="text-gray-600">Total Submitted</div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Tools for Civic Engagement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides everything you need to report, track, and resolve community issues effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/report')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-all group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Reporting</h3>
              <p className="text-gray-600">Capture and report issues with intelligent categorization</p>
            </button>

            <button
              onClick={() => navigate('/my-reports')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-all group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Reports</h3>
              <p className="text-gray-600">Real-time updates on your submitted reports</p>
            </button>

            <button
              onClick={() => navigate('/validate-reports')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-all group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Validate Reports</h3>
              <p className="text-gray-600">Help verify community reports for accuracy</p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-all group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">My Profile</h3>
              <p className="text-gray-600">Manage your account and preferences</p>
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
                <p className="text-gray-600">Real-time updates from your community</p>
              </div>
              <button
                onClick={() => navigate('/my-reports')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                View All Reports
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-6">No reports yet</p>
                  <button
                    onClick={() => navigate('/report')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Submit Your First Report
                  </button>
                </div>
              ) : (
                recentReports.map((report) => (
                  <div key={report.report_id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-white rounded-xl">
                        <Activity className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{report.report_type}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {report.report_id}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/status/${report.report_id}`);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenHomepage;