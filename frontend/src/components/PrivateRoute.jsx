import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// In any component
import { getMyReports, getMyStats, getAdminDashboard } from '../services/apiServices';

/**
 * Component to protect routes.
 * Redirects unauthenticated users to the login page.
 * Redirects authenticated users to their role-based homepage if they try to access a restricted page.
 */
function PrivateRoute({ children, requiredRole }) {
  // Destructure user, isAuthenticated, isLoading, and the new getRedirectPath function
  const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner while the authentication status is being checked
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page.
    // Pass the current location so they can be redirected back after logging in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if a specific role is required and if the user's role matches.
  // Using toLowerCase() makes the comparison case-insensitive.
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole) {
    // 🟢 FIX: If the user's role does not match the required role,
    // redirect them to their designated homepage using getRedirectPath().
    return <Navigate to={getRedirectPath()} replace />;
  }

  // If the user is authenticated and has the required role, render the children components.
  return children;
}

export default PrivateRoute;