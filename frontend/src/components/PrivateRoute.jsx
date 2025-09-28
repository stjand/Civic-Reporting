import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component to protect routes.
 * Redirects unauthenticated users to the login page.
 */
function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a loading spinner or null while checking auth status
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    ); 
  }

  if (!isAuthenticated) {
    // CHECK: If admin role is required, redirect to login with admin=true flag
    if (requiredRole === 'admin') {
        return <Navigate to={`/login?admin=true`} state={{ from: location }} replace />;
    }
    // Default redirect to login for all other protected routes
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Note: Using toLowerCase() here makes the role check robust against database capitalization errors.
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole) { 
    // If a role is required and the user doesn't have it, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;