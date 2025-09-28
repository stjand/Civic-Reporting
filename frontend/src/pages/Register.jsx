import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Shield, Briefcase, PlusCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Assume this exists

/**
 * List of common government departments/roles for a civic application
 */
const GOVERNMENT_DEPARTMENTS = [
  'Public Works & Infrastructure',
  'Urban Planning & Development',
  'Sanitation & Waste Management',
  'Parks & Recreation',
  'Traffic & Transportation',
  'Utilities (Water/Electricity)',
  'Health & Safety',
  'Administration',
  'IT Department',
];

/**
 * Register Page Component
 * Allows users (Citizen or Admin) to sign up, collecting role-specific data.
 */
const Register = () => {
  const [role, setRole] = useState('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Government Official specific state
  const [department, setDepartment] = useState(GOVERNMENT_DEPARTMENTS[0]);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth(); // Assuming useAuth provides a register function

  // Determine initial role from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlRole = params.get('role');
    if (urlRole && (urlRole === 'admin' || urlRole === 'citizen')) {
      setRole(urlRole);
    }
  }, [location.search]);

  // Handler for form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);

    // Prepare role-specific data
    const userData = {
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'citizen', // Ensure role is explicitly set
      // Only include department if the user is an admin (Government Official)
      department: role === 'admin' ? department : null,
    };

    try {
      // The register function should handle role-based user creation
      // In a real application, the API endpoint would validate and create the user.
      await register(userData);
      
      // Redirect to the appropriate flow after successful registration
      const redirectTo = role === 'admin' ? '/analytics' : '/submit-report';
      
      // Navigate to the dashboard or report submission page
      navigate(redirectTo, { replace: true });
      
    } catch (err) {
      // In a real app, 'err' would be the API error message
      setError(err.message || `Registration failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Component title based on role
  const formTitle = role === 'admin' 
    ? 'Register as Government Official'
    : 'Register as Citizen Reporter';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <PlusCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            {formTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the platform and start making a difference.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          
          {/* Role Switcher Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setRole(role === 'citizen' ? 'admin' : 'citizen')}
              className="w-full py-2 px-4 border border-blue-200 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Switch to{' '}
              <span className="font-semibold ml-1">
                {role === 'citizen' ? 'Government Official' : 'Citizen'} Sign Up
              </span>
            </button>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Department Dropdown (Admin Only) */}
          {role === 'admin' && (
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department/Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="department"
                  name="department"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field appearance-none"
                >
                  {GOVERNMENT_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
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
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <PlusCircle className="w-5 h-5 mr-2 animate-pulse" />
                  Signing Up...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign Up
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;