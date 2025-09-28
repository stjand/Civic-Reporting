import React, { useState } from 'react';
import { 
  CheckSquare, 
  ThumbsUp, 
  ThumbsDown,
  MapPin,
  Calendar,
  User,
  Flag,
  ArrowLeft,
  Shield,
  Bell,
  Camera,
  Mic,
  Eye,
  SkipForward,
  AlertTriangle,
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Custom navigation function
const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const ValidateReports = () => {
  const { user, logout } = useAuth();
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [userPoints, setUserPoints] = useState(248); // Mock user points

  // Mock reports needing validation
  const [reportsToValidate] = useState([
    {
      id: 'RPT-005',
      title: 'Damaged sidewalk causing safety hazard',
      description: 'Large cracks in the sidewalk near the bus stop make it difficult for pedestrians, especially those with mobility aids, to walk safely.',
      category: 'Infrastructure',
      location: 'Bus Stop, Maple Street & 3rd Avenue',
      submitted_by: 'Sarah Chen',
      submitted_date: '2024-01-20T14:30:00Z',
      images: [
        'https://via.placeholder.com/400x300?text=Damaged+Sidewalk+1',
        'https://via.placeholder.com/400x300?text=Damaged+Sidewalk+2'
      ],
      has_audio: true,
      priority: 'Medium',
      current_votes: 3,
      validation_needed: 7
    },
    {
      id: 'RPT-006',
      title: 'Broken traffic signal at busy intersection',
      description: 'The traffic signal has been malfunctioning for two days, causing dangerous conditions for both vehicles and pedestrians.',
      category: 'Traffic Safety',
      location: 'Main Street & Oak Avenue Intersection',
      submitted_by: 'Mike Rodriguez',
      submitted_date: '2024-01-19T09:15:00Z',
      images: [
        'https://via.placeholder.com/400x300?text=Broken+Traffic+Signal'
      ],
      has_audio: false,
      priority: 'High',
      current_votes: 8,
      validation_needed: 2
    },
    {
      id: 'RPT-007',
      title: 'Illegal dumping in community park',
      description: 'Someone has dumped construction debris near the playground area, creating both safety and environmental concerns.',
      category: 'Waste Management',
      location: 'Riverside Community Park, Near Playground',
      submitted_by: 'Jennifer Walsh',
      submitted_date: '2024-01-18T16:45:00Z',
      images: [
        'https://via.placeholder.com/400x300?text=Illegal+Dumping+1',
        'https://via.placeholder.com/400x300?text=Illegal+Dumping+2',
        'https://via.placeholder.com/400x300?text=Illegal+Dumping+3'
      ],
      has_audio: true,
      priority: 'High',
      current_votes: 12,
      validation_needed: 3
    }
  ]);

  const currentReport = reportsToValidate[currentReportIndex];
  const hasMoreReports = currentReportIndex < reportsToValidate.length - 1;

  const handleValidate = (isValid) => {
    setValidatedCount(prev => prev + 1);
    setUserPoints(prev => prev + (isValid ? 10 : 5)); // Points for validation
    
    if (hasMoreReports) {
      setCurrentReportIndex(prev => prev + 1);
    } else {
      // Show completion message or redirect
      alert('Great job! You\'ve validated all available reports. Thank you for your contribution!');
      navigate('/citizen');
    }
  };

  const handleSkip = () => {
    if (hasMoreReports) {
      setCurrentReportIndex(prev => prev + 1);
    } else {
      navigate('/citizen');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
              {/* User Points */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">{userPoints} points</span>
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
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
                <p className="text-2xl font-bold text-blue-600">{reportsToValidate.length - currentReportIndex}</p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{userPoints}</p>
                <p className="text-xs text-gray-600">Total Points</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Community Validator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentReport ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Report Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentReport.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Reported by {currentReport.submitted_by}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(currentReport.submitted_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {currentReport.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(currentReport.priority)}`}>
                    {currentReport.priority} Priority
                  </span>
                  <span className="text-sm text-gray-600">
                    Report #{currentReport.id}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Validations: {currentReport.current_votes}/{currentReport.current_votes + currentReport.validation_needed}</span>
                <span>Report {currentReportIndex + 1} of {reportsToValidate.length}</span>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(currentReport.current_votes / (currentReport.current_votes + currentReport.validation_needed)) * 100}%` 
                  }}
                ></div>
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
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Location
                </h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{currentReport.location}</p>
              </div>

              {/* Media */}
              {(currentReport.images.length > 0 || currentReport.has_audio) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                  
                  {/* Images */}
                  {currentReport.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {currentReport.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Report evidence ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio */}
                  {currentReport.has_audio && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Mic className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Audio Description</p>
                          <p className="text-sm text-gray-600">Reporter provided audio context</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <audio controls className="w-full">
                          <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}
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
                    <li>Do the photos/audio support the reported problem?</li>
                    <li>Is the location specific and identifiable?</li>
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
                    <span>Valid Report (+10 pts)</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                  <Flag className="w-4 h-4" />
                  <span>Report as Inappropriate</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <CheckSquare className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
            <p className="text-gray-600 mb-6">
              You've validated all available reports. Thank you for helping to improve our community!
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