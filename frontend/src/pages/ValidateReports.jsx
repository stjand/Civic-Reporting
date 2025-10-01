import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Award,
  SkipForward
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
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getValidationReports();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.error || 'Failed to load reports');
      console.error('Error fetching validation reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentReport = reports[currentIndex];
  const progress = reports.length > 0 ? ((currentIndex + 1) / reports.length) * 100 : 0;

  const handleValidate = async (isValid) => {
    setActionLoading(true);
    
    // Simulate API call - replace with actual validation API
    const response = await validateReport(currentReport.report_id, isValid);
  };

  const handleSkip = () => {
    if (currentIndex < reports.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigate('/citizen');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Reports</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/citizen')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentReport || currentIndex >= reports.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Great Work!</h2>
          <p className="text-gray-600 mb-2">
            You've validated <span className="font-bold text-blue-600">{validatedCount}</span> reports
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {reports.length === 0 
              ? 'No reports available for validation at this time.'
              : 'Thank you for helping improve our community!'}
          </p>
          <button
            onClick={() => navigate('/citizen')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/citizen')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{validatedCount}</span>
              <span className="text-gray-500 text-sm">validated</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{reports.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Report Type Badge */}
          <div className="px-6 pt-6 pb-4">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {currentReport.report_type}
            </span>
          </div>

          {/* Photo */}
          {currentReport.photo_url && (
            <div className="px-6 pb-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                <img
                  src={currentReport.photo_url}
                  alt="Report evidence"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = `
                      <div class="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-sm">Image unavailable</span>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="px-6 pb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {currentReport.description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              <span>{new Date(currentReport.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            {(currentReport.latitude && currentReport.longitude) && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                <span>{currentReport.latitude.toFixed(6)}, {currentReport.longitude.toFixed(6)}</span>
              </div>
            )}
          </div>

          {/* Validation Prompt */}
          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Validation Criteria</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Is the issue clearly described?</li>
              <li>• Does the photo support the claim?</li>
              <li>• Is this a genuine community concern?</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={actionLoading}
            className="w-full mb-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip This Report
          </button>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleValidate(false)}
              disabled={actionLoading}
              className="py-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Invalid</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => handleValidate(true)}
              disabled={actionLoading}
              className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Valid</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateReports;