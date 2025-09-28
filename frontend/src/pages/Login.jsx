import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Assume this exists

/**
 * Login Page Component
 * Allows users (Citizen or Admin) to log in.
 */
const Login = () => {
  const [role, setRole] = useState('citizen'); // Default role is 'citizen'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Assuming useAuth provides a login function

  // Check for admin flag in URL query parameter, set default role if present
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('admin') === 'true') {
      setRole('admin');
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // The login function should handle role-based authentication and redirection
      await login(email, password, role);

      // Determine redirection based on role (using the logic we'll define later)
      const redirectTo = role === 'admin' ? '/analytics' : '/submit-report';
      
      // Redirect to the intended page or the default dashboard
      // The 'replace' ensures the user can't navigate back to the login page easily
      navigate(redirectTo, { replace: true });
      
    } catch (err) {
      // In a real app, 'err' would be the API error message
      setError(err.message || 'Login failed. Check your credentials and role.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Sign in to CivicReport
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Continue as a Citizen or a Government Official
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          
          {/* Role Selector Dropdown */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="citizen">Citizen Reporter</option>
                <option value="admin">Government Official</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md" role="alert">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <LogIn className="w-5 h-5 mr-2 animate-pulse" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Registration Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to={`/register?role=${role}`}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign up as a {role === 'admin' ? 'Government Official' : 'Citizen'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;