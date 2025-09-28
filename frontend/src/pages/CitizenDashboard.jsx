// Exact path of file: frontend/src/pages/CitizenDashboard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  CheckCircle, 
  User, 
  ArrowRight, 
  PlusCircle,
  ListOrdered,
  ShieldCheck,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Citizen Dashboard Component
 * Serves as the main authenticated landing page for citizen users.
 * Provides quick access to their core functionalities.
 */
const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    // Should be handled by PrivateRoute, but good for safety
    return <div className="text-center py-10">Please log in.</div>;
  }

  const citizenActions = [
    {
      title: 'Submit New Report',
      description: 'Quickly log a new civic issue in your community.',
      icon: PlusCircle,
      color: 'bg-blue-600 text-blue-50',
      path: '/report',
    },
    {
      title: 'My Submitted Reports',
      description: 'View the status and history of all your reports.',
      icon: ListOrdered,
      color: 'bg-green-600 text-green-50',
      path: '/my-reports',
    },
    {
      title: 'Validate Reports',
      description: 'Help the city by verifying nearby reports from other citizens.',
      icon: ShieldCheck,
      color: 'bg-purple-600 text-purple-50',
      path: '/validate-reports',
    },
    {
      title: 'My Profile',
      description: 'Manage your personal information and preferences.',
      icon: User,
      color: 'bg-yellow-600 text-yellow-50',
      path: '/profile',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Welcome */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600">
                Your civic hub is ready. Here are your main actions.
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition duration-150 p-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
        
        {/* Quick Action Grid */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {citizenActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(action.path)}
                className="card p-6 text-left transform hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full bg-white rounded-xl shadow-md border border-gray-100"
              >
                <div>
                  <div className={`p-3 rounded-xl mb-4 inline-flex ${action.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                </div>
                <div className="flex items-center text-blue-600 font-medium text-sm mt-2">
                  Go to {action.title} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Status Snapshot (Placeholder) */}
        <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Your Report Snapshot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                        <p className="text-sm text-gray-500">Total Submitted</p>
                        <p className="text-2xl font-bold text-gray-900">5</p> {/* Mock Data */}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center space-x-4">
                    <MapPin className="w-8 h-8 text-yellow-500" />
                    <div>
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900">2</p> {/* Mock Data */}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center space-x-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                        <p className="text-sm text-gray-500">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">3</p> {/* Mock Data */}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CitizenDashboard;