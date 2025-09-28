// Exact path of file: frontend/src/pages/AdminDashboard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    ArrowLeft, 
    Settings, 
    FileText, 
    Users, 
    BarChart3, 
    MapPin, 
    Shield,
    LogOut,
    CheckCircle,
    Loader2
} from 'lucide-react';

/**
 * Admin Dashboard Component
 * The main operational dashboard for Government Officials.
 */
const AdminDashboard = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Safety check, though PrivateRoute should enforce this
  if (!user || user.role !== 'admin') {
    return <div className="text-center py-10">Access Denied. Please log in as a Government Official.</div>;
  }
  
  // --- Mock Data for Dashboard ---
  const reportsData = [
    { id: 'RPT-001', type: 'Road Maintenance', location: 'MG Road', status: 'In Progress', priority: 'High', assigned: 'Public Works' },
    { id: 'RPT-002', type: 'Waste Overflow', location: 'Brigade Road', status: 'Resolved', priority: 'Low', assigned: 'Sanitation' },
    { id: 'RPT-003', type: 'Street Light Out', location: 'Koramangala', status: 'New', priority: 'Medium', assigned: 'Utilities' },
    { id: 'RPT-004', type: 'Park Vandalism', location: 'Cubbon Park', status: 'Under Review', priority: 'Medium', assigned: 'Parks & Rec' },
    { id: 'RPT-005', type: 'Illegal Dumping', location: 'Electronic City', status: 'New', priority: 'High', assigned: 'Sanitation' },
  ];

  const summaryStats = [
    { label: 'Total Reports', value: '5,210', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Unassigned (New)', value: '1,012', icon: MapPin, color: 'text-red-600', bgColor: 'bg-red-100' },
    { label: 'Verified Reports', value: '4,198', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Active Users', value: '15,800', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];
  // --- End Mock Data ---

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-500 text-white';
      case 'In Progress': return 'bg-yellow-500 text-gray-800';
      case 'New': return 'bg-blue-500 text-white';
      case 'Under Review': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center space-x-4">
            <button
                onClick={() => navigate('/analytics')}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
                title="Back to Analytics Overview"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
                <Settings className="w-7 h-7 mr-3 text-indigo-600" />
                Administrative Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Managing reports for {user.department || 'All Departments'}
              </p>
            </div>
          </div>
          <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition duration-150 p-2 rounded-lg hover:bg-red-50"
          >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {summaryStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Reports Table (Main Panel) */}
            <div className="lg:col-span-9">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Reports Overview</h2>
                        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
                            Filter & Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Report ID</th>
                                    <th className="table-header">Issue Type</th>
                                    <th className="table-header">Location</th>
                                    <th className="table-header">Priority</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Assigned To</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportsData.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="table-cell font-medium text-blue-600">{report.id}</td>
                                        <td className="table-cell">{report.type}</td>
                                        <td className="table-cell flex items-center space-x-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{report.location}</span>
                                        </td>
                                        <td className={`table-cell font-semibold ${
                                            report.priority === 'High' ? 'text-red-600' : 
                                            report.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                            {report.priority}
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="table-cell text-sm text-gray-700">{report.assigned}</td>
                                        <td className="table-cell text-sm">
                                            <button 
                                                onClick={() => navigate(`/status/${report.id}`)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Side Panel (Quick Info / Department Focus) */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* User Info Card */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">My Department Focus</h3>
                    <p className="text-indigo-700 text-xl font-bold mb-1">{user.department || 'Admin'}</p>
                    <p className="text-sm text-indigo-600">Reports assigned to your team: 124 open</p>
                </div>

                {/* Report Distribution Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
                    <div className="space-y-3 text-sm">
                        <ChartItem label="Roads" value={35} color="bg-red-400" />
                        <ChartItem label="Sanitation" value={25} color="bg-yellow-400" />
                        <ChartItem label="Utilities" value={20} color="bg-blue-400" />
                        <ChartItem label="Public Safety" value={10} color="bg-green-400" />
                        <ChartItem label="Other" value={10} color="bg-gray-400" />
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

// Helper component for the mock Chart
const ChartItem = ({ label, value, color }) => (
    <div className="flex items-center space-x-2">
        <span className="w-16 text-gray-700">{label}</span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full">
            <div 
                className={`h-3 rounded-full ${color}`} 
                style={{ width: `${value}%` }} 
            />
        </div>
        <span className="w-8 text-right font-medium text-gray-800">{value}%</span>
    </div>
);

export default AdminDashboard;