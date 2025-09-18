import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));

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
            path="/report" 
            element={<ReportForm />} 
          />
          <Route 
            path="/status/:id" 
            element={<ReportStatus />} 
          />
          
          {/* Protected Admin Route */}
          <Route 
            path="/admin" 
            element={<AdminDashboard />} 
          />
          
          {/* Redirect /home to / for consistency */}
          <Route 
            path="/home" 
            element={<Navigate to="/" replace />} 
          />
          
          {/* 404 Fallback - you can create a NotFound component later */}
          <Route 
            path="*" 
            element={
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page not found</p>
                <Navigate to="/" replace />
              </div>
            } 
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;