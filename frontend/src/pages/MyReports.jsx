// Exact path of file: frontend/src/pages/MyReports.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ListOrdered, Clock, CheckCircle, MapPin, ArrowLeft } from 'lucide-react';

/**
 * My Reports Component
 * Displays a list of all reports submitted by the current citizen user.
 */
const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Mock Data: Replace with API call fetching reports for the current user ---
  const mockReports = [
    {
      id: 'RPT-005',
      title: 'Broken Traffic Light at Main/1st',
      category: 'Traffic & Transportation',
      status: 'In Progress',
      location: 'Main Street & 1st Ave',
      submitted: '2 days ago',
    },
    {
      id: 'RPT-004',
      title: 'Overflowing Public Bin',
      category: 'Sanitation & Waste Management',
      status: 'Resolved',
      location: 'Central Park Entrance',
      submitted: '5 days ago',
    },
    {
      id: 'RPT-003',
      title: 'Graffiti on Library Wall',
      category: 'Public Works & Infrastructure',
      status: 'Under Review',
      location: 'City Library, East Wall',
      submitted: '1 week ago',
    },
  ];
  // --- End Mock Data ---

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Resolved':
        return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Resolved</span>;
      case 'In Progress':
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">In Progress</span>;
      case 'Under Review':
        return <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Under Review</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">New</span>;
    }
  };

  const handleReportClick = (reportId) => {
    // Navigate to the public report status page for details
    navigate(`/status/${reportId}`);
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
            <button
                onClick={() => navigate('/citizen-dashboard')}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <ListOrdered className="w-7 h-7 mr-3 text-blue-600" />
                    My Submitted Reports
                </h1>
                <p className="text-gray-600 mt-1">
                    Review the status of the issues you have reported, {user?.name || 'Citizen'}.
                </p>
            </div>
        </div>
        
        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
                
                {mockReports.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <p className="mb-4">You haven't submitted any reports yet.</p>
                        <button
                            onClick={() => navigate('/report')}
                            className="text-blue-600 font-medium hover:text-blue-700 transition"
                        >
                            Submit Your First Report
                        </button>
                    </div>
                ) : (
                    mockReports.map((report) => (
                        <div
                            key={report.id}
                            className="p-5 hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleReportClick(report.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-600 mb-1">{report.id} - {report.category}</p>
                                    <h2 className="text-lg font-semibold text-gray-900 truncate mb-2">
                                        {report.title}
                                    </h2>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{report.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>Submitted {report.submitted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2 ml-4">
                                    {getStatusBadge(report.status)}
                                    <span className="text-xs text-gray-400">View Details &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
            <button
                onClick={() => navigate('/report')}
                className="btn btn-lg bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 rounded-lg shadow-md font-semibold flex items-center"
            >
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit New Report
            </button>
        </div>
      </div>
    </div>
  );
};

export default MyReports;