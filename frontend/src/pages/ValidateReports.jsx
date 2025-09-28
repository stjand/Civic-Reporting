// Exact path of file: frontend/src/pages/ValidateReports.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Tag, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowLeft, 
  RotateCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Validate Reports Component
 * Allows citizen users to view and validate recent, unverified reports near them.
 */
const ValidateReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportsToValidate, setReportsToValidate] = useState([
    // Mock data for reports needing validation
    {
      id: 'RPT-008',
      title: 'Damaged Sidewalk Pavement',
      description: 'A large, cracked section of the sidewalk near the bus stop is a tripping hazard.',
      category: 'Public Works & Infrastructure',
      location: '123 Oak St, near Elmwood Bus Stop',
      image: 'sidewalk-image.jpg',
      urgency: 'Medium',
    },
    {
      id: 'RPT-009',
      title: 'Non-functional Street Light',
      description: 'The street light at the corner has been out for three nights.',
      category: 'Utilities',
      location: 'Corner of 5th Ave and Maple St',
      image: 'streetlight-image.jpg',
      urgency: 'Low',
    },
  ]);
  const [validationMessage, setValidationMessage] = useState(null);

  /**
   * Handles the citizen's validation action (Verify or Dispute).
   * @param {string} reportId 
   * @param {string} action 'verify' or 'dispute'
   */
  const handleValidate = (reportId, action) => {
    // 1. Simulate API call to register validation
    console.log(`User ${user.id} performing ${action} on report ${reportId}`);

    // 2. Remove the validated report from the list
    setReportsToValidate(prev => prev.filter(report => report.id !== reportId));

    // 3. Set confirmation message
    const actionText = action === 'verify' ? 'Verified' : 'Disputed';
    setValidationMessage({ 
        type: action, 
        text: `Report ${reportId} successfully ${actionText}. Thank you for your contribution!`
    });

    // Clear message after a few seconds
    setTimeout(() => setValidationMessage(null), 4000);
  };

  const handleRefresh = () => {
      setReportsToValidate([]); // Clear existing
      setValidationMessage({ type: 'info', text: 'Fetching new reports to validate...' });
      // Simulate fetching new reports
      setTimeout(() => {
          setReportsToValidate([
            // New mock reports
            {
                id: 'RPT-010',
                title: 'Missing Stop Sign',
                description: 'The stop sign at the intersection was knocked down and is missing.',
                category: 'Traffic & Transportation',
                location: 'Intersection of Pine and 8th',
                image: 'stopsign-missing.jpg',
                urgency: 'High',
            }
          ]);
          setValidationMessage(null);
      }, 1500);
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
        case 'High': return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">High Urgency</span>;
        case 'Medium': return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Medium Urgency</span>;
        default: return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Low Urgency</span>;
    }
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-start space-x-4 mb-8">
            <button
                onClick={() => navigate('/citizen-dashboard')}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className='flex-1'>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <ShieldCheck className="w-7 h-7 mr-3 text-purple-600" />
                    Validate Community Reports
                </h1>
                <p className="text-gray-600 mt-1">
                    Your contribution helps the city prioritize real issues. Verify if the report accurately reflects the situation.
                </p>
            </div>
            <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
                <RotateCw className="w-4 h-4" />
                <span>Refresh</span>
            </button>
        </div>

        {/* Validation Message */}
        {validationMessage && (
            <div className={`p-4 mb-6 rounded-lg font-medium ${
                validationMessage.type === 'verify' ? 'bg-green-100 text-green-800' :
                validationMessage.type === 'dispute' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
            }`}>
                {validationMessage.text}
            </div>
        )}

        {/* Reports List */}
        {reportsToValidate.length > 0 ? (
            <div className="space-y-6">
                {reportsToValidate.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                            {getUrgencyBadge(report.urgency)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{report.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <span>{report.category}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 border-l-4 border-gray-100 pl-4 py-2 bg-gray-50 rounded-md">
                            {report.description}
                        </p>

                        <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4">
                            <button
                                onClick={() => handleValidate(report.id, 'dispute')}
                                className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition"
                            >
                                <ThumbsDown className="w-5 h-5" />
                                <span>Dispute</span>
                            </button>
                            <button
                                onClick={() => handleValidate(report.id, 'verify')}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition"
                            >
                                <ThumbsUp className="w-5 h-5" />
                                <span>Verify</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
                <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">All Clear!</h3>
                <p className="text-gray-600 mb-6">You've validated all available reports in your area. Check back later!</p>
                <button
                    onClick={handleRefresh}
                    className="flex items-center justify-center mx-auto space-x-2 px-4 py-2 border border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                    <RotateCw className="w-5 h-5" />
                    <span>Check for New Reports</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ValidateReports;