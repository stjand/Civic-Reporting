import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  ThumbsUp, 
  ThumbsDown,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Shield,
  Bell,
  Eye,
  SkipForward,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getValidationReports } from '../services/apiServices';

const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const ValidateReports = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getValidationReports();
      setReports(data.reports);
    } catch (err) {
      setError(err.error || 'Failed to load reports for validation');
      console.error('Error fetching validation reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentReport = reports[currentIndex];
  const hasMoreReports = currentIndex < reports.length - 1;

  const handleValidate = (isValid) => {
    setValidatedCount(prev => prev + 1);
    
    if (hasMoreReports) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('Great job! You\'ve validated all available reports. Thank you for your contribution!');
      navigate('/citizen');
    }
  };

  const handleSkip = () => {
    if (hasMoreReports) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigate('/citizen');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports to validate...</p>
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
              <button
                onClick={() => navigate('/citizen')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Validate Reports</h1>
                <p className="text-sm text-gray-500">Help verify community reports</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">{validatedCount} validated</span>
              </div>
              
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

      {/* Progress Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{validatedCount}</p>
                <p className="text-xs text-gray-600">Validated Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{reports.length - currentIndex}</p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>
            
            <span className="text-sm text-gray-600">
              Report {currentIndex + 1} of {reports.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {currentReport ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Report Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentReport.report_type}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(currentReport.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {currentReport.report_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Report Description</h3>
                <p className="text-gray-700 leading-relaxed">{currentReport.description}</p>
              </div>

              {/* Location */}
              {(currentReport.latitude && currentReport.longitude) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Location
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Coordinates: {currentReport.latitude}, {currentReport.longitude}
                  </p>
                </div>
              )}

              {/* Photo */}
              {currentReport.photo_url && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Photo Evidence</h3>
                  <div className="relative group">
                    <img
                      src={currentReport.photo_url}
                      alt="Report evidence"
                      className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Validation Question */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Validation Question</h3>
                <p className="text-blue-800 mb-4">
                  Based on the information provided, does this appear to be a legitimate community issue that requires attention?
                </p>
                <div className="text-sm text-blue-700">
                  <p className="mb-1"><strong>Consider:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Is the issue clearly described and actionable?</li>
                    <li>Do the photos support the reported problem?</li>
                    <li>Is the location information provided?</li>
                    <li>Does this seem like a genuine community concern?</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip This Report</span>
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleValidate(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Not Valid</span>
                  </button>

                  <button
                    onClick={() => handleValidate(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Valid Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <CheckSquare className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
            <p className="text-gray-600 mb-6">
              {reports.length === 0 
                ? 'No reports available for validation at this time.'
                : 'You\'ve validated all available reports. Thank you for helping to improve our community!'}
            </p>
            <button
              onClick={() => navigate('/citizen')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidateReports;