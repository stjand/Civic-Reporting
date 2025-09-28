// Exact path of file: frontend/src/pages/GovernmentOfficialAnalytics.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Government Official Analytics Overview Component
 * The initial landing page for logged-in Government Officials (Admins).
 * Shows key high-level metrics and a button to proceed to the full Dashboard.
 */
const GovernmentOfficialAnalytics = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user || user.role !== 'admin') {
    // Safety redirect, though PrivateRoute should handle this
    return navigate('/login?admin=true', { replace: true });
  }

  // --- Mock Data for Analytics Overview ---
  const stats = [
    { 
      number: '4,102', 
      label: 'Total Reports Filed', 
      icon: BarChart3, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      number: '68%', 
      label: 'Overall Resolution Rate', 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      number: '247', 
      label: 'Open High Priority Issues', 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      number: '14.5 hrs', 
      label: 'Avg. Response Time', 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ];

  const handleViewDashboard = () => {
    // Navigate to the full admin dashboard route
    navigate('/admin');
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header and Welcome */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-indigo-600" />
                Official Analytics Overview
              </h1>
              <p className="text-gray-600">
                Welcome, {user.name.split(' ')[0]} ({user.department || 'Administrator'}). 
                Review current system performance at a glance.
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
        
        {/* Key Metrics */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Key Performance Indicators (KPIs)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className={`p-3 rounded-full mb-3 inline-flex ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</p>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Chart Placeholder (Simulated) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports Filed by Category (Last 30 Days)</h3>
            {/* Simple Bar Chart Placeholder */}
            <div className="space-y-4 pt-4">
                <AnalyticsBar label="Road Maintenance" value={55} color="bg-red-500" count={120} />
                <AnalyticsBar label="Sanitation" value={75} color="bg-yellow-500" count={165} />
                <AnalyticsBar label="Public Safety" value={40} color="bg-blue-500" count={88} />
                <AnalyticsBar label="Utilities" value={60} color="bg-green-500" count={132} />
            </div>
        </div>

        {/* Call to Action to Full Dashboard */}
        <div className="text-center p-8 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Need Deeper Insights?</h2>
            <p className="text-indigo-700 mb-6">
                Click below to access the full administrative dashboard for detailed reporting management, user controls, and advanced filtering.
            </p>
            <button
              onClick={handleViewDashboard}
              className="btn btn-lg bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200 py-3 px-8 rounded-lg shadow-md font-semibold text-base flex items-center justify-center mx-auto"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Full Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
        </div>

      </div>
    </div>
  );
};

// Helper component for the mock bar chart
const AnalyticsBar = ({ label, value, color, count }) => (
  <div className="flex items-center space-x-4">
    <span className="w-32 text-sm font-medium text-gray-700">{label}</span>
    <div className="flex-1 bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full ${color}`} 
        style={{ width: `${value}%` }} 
      />
    </div>
    <span className="w-12 text-right text-sm font-semibold text-gray-900">{count}</span>
  </div>
);

export default GovernmentOfficialAnalytics;