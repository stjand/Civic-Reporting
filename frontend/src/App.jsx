import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

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
    // Wrap everything with AuthProvider
    <AuthProvider> 
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
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
            
            {/* Protected Report Submission Route */}
            <Route 
              path="/report" 
              element={
                <PrivateRoute>
                  <ReportForm />
                </PrivateRoute>
              } 
            />
            
            {/* Report Status remains public */}
            {/*
              --- FIX: Add a new route for '/status' to display the search form ---
              This allows Home.jsx buttons navigating to '/status' to work.
            */}
            <Route 
              path="/status" 
              element={<ReportStatus />} 
            />
            <Route 
              path="/status/:id" 
              element={<ReportStatus />} 
            />
            
            {/* Protected Admin Route */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Redirect /home to / for consistency */}
            <Route 
              path="/home" 
              element={<Navigate to="/" replace />} 
            />
            
            {/* 404 Fallback */}
            <Route 
              path="*" 
              element={
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found. Redirecting...</p>
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