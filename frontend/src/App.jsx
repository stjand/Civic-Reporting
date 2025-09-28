// Exact path of file: frontend/src/App.jsx

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register')); 

// --- NEW/UPDATED Imports ---
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard')); // <-- NEW Citizen Landing
// Note: We use AdminDashboard for the 'View Dashboard' button *after* analytics
const AdminDashboard = lazy(() => import('./pages/AdminDashboard')); 
// This is the Gov Official's initial landing page
const GovernmentOfficialAnalytics = lazy(() => import('./pages/GovernmentOfficialAnalytics')); 
// Citizen Sub-pages (assuming existence)
const MyReports = lazy(() => import('./pages/MyReports')); 
const ValidateReports = lazy(() => import('./pages/ValidateReports'));
const Profile = lazy(() => import('./pages/Profile'));


// Simple loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Main Application Component
 * Handles routing with lazy loading and clean structure
 */
function App() {
  return (
    <AuthProvider> 
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* ------------------------------------------------------------------ */}
            {/* PUBLIC ROUTES                           */}
            {/* ------------------------------------------------------------------ */}
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/login" 
              element={<Login />} 
            />
            <Route 
              path="/register"
              element={<Register />} 
            />
            
            {/* Report Status (Public) - Needs two routes to handle search form/details */}
            <Route 
              path="/status" 
              element={<ReportStatus />} 
            />
            <Route 
              path="/status/:id" 
              element={<ReportStatus />} 
            />
            
            {/* Redirect /home to / for consistency */}
            <Route 
              path="/home" 
              element={<Navigate to="/" replace />} 
            />

            {/* ------------------------------------------------------------------ */}
            {/* CITIZEN PROTECTED ROUTES                */}
            {/* ------------------------------------------------------------------ */}
            
            {/* Citizen Landing Page (Replaces direct access to /report after login) */}
            <Route
              path="/citizen-dashboard"
              element={
                <PrivateRoute requiredRole="citizen">
                  <CitizenDashboard /> 
                </PrivateRoute>
              }
            />
            
            {/* Citizen Core Pages */}
            <Route 
              path="/report" 
              element={
                <PrivateRoute requiredRole="citizen">
                  <ReportForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-reports" 
              element={
                <PrivateRoute requiredRole="citizen">
                  <MyReports /> {/* Placeholder: My Reports Page */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/validate-reports" 
              element={
                <PrivateRoute requiredRole="citizen">
                  <ValidateReports /> {/* Placeholder: Validate Reports Page */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute requiredRole="citizen">
                  <Profile /> {/* Placeholder: Profile Page */}
                </PrivateRoute>
              } 
            />
            

            {/* ------------------------------------------------------------------ */}
            {/* GOVERNMENT OFFICIAL PROTECTED ROUTES          */}
            {/* ------------------------------------------------------------------ */}

            {/* Admin Landing Page (Analytics View - first thing they see) */}
            <Route 
              path="/analytics" 
              element={
                <PrivateRoute requiredRole="admin">
                  <GovernmentOfficialAnalytics />
                </PrivateRoute>
              } 
            />

            {/* Admin Dashboard (The full page accessed via button on Analytics) */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard /> 
                </PrivateRoute>
              } 
            />
            
            {/* ------------------------------------------------------------------ */}
            {/* 404 FALLBACK                          */}
            {/* ------------------------------------------------------------------ */}
            <Route 
              path="*" 
              element={
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found. Redirecting to home...</p>
                  <Navigate to="/" replace />
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  );
}

export default App;