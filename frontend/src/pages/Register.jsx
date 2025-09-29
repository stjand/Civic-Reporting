import React, { useState } from 'react';
import { UserPlus, User, Shield, MapPin, Building, Award, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
// **FIX**: Import the real useAuth hook from your context
import { useAuth } from '../context/AuthContext.jsx';

// Custom navigation function
const navigate = (path) => {
    if (path) {
        window.history.pushState({}, '', path)
        window.dispatchEvent(new Event('navigate'))
    }
}

// **FIX**: The mock useAuth hook has been removed from here.

function Register() {
  // **FIX**: This now uses the real signup function from your AuthContext
  const { signup } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    department: '',
    designation: '',
    location: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const departments = [
    "Roads & Infrastructure",
    "Sanitation",
    "Electrical",
    "Water Supply",
    "Parks & Environment"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      let strength = 0;
      if (value.length > 7) strength++;
      if (value.match(/[a-z]/)) strength++;
      if (value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^a-zA-Z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (formData.role === 'official' && (!formData.department || !formData.designation || !formData.location)) {
        setError('Department, designation, and location are required for government officials.');
        setIsSubmitting(false);
        return;
    }
    
    try {
      // **FIX**: This now calls the real signup function from the context
      await signup(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-8 bg-white shadow-lg rounded-xl">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600">A confirmation link has been sent to your email. Please verify to continue.</p>
                 <button
                    onClick={() => navigate('/login')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Side (Visual) */}
        <div className="w-1/2 bg-gradient-to-tr from-blue-600 to-indigo-600 p-12 text-white hidden lg:flex flex-col justify-between">
            <div>
                <h1 className="text-4xl font-extrabold mb-4 leading-tight">Join CivicReport</h1>
                <p className="text-lg text-indigo-100">Become an active member of your community. Report issues, track progress, and make a real difference.</p>
            </div>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><User className="w-6 h-6"/></div>
                    <p>Register as a <span className="font-bold">Citizen</span> to report local issues.</p>
                </div>
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Shield className="w-6 h-6"/></div>
                    <p>Register as a <span className="font-bold">Government Official</span> to manage and resolve reports.</p>
                </div>
            </div>
             <div>
                <p className="text-sm text-indigo-200">&copy; 2025 CivicReport. All rights reserved.</p>
            </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900">Create an Account</h2>
              <p className="text-gray-500 mt-2 text-lg">Let's get you started!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, role: 'citizen'})} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'citizen' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <User className={`w-8 h-8 mb-2 ${formData.role === 'citizen' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-semibold">Citizen</span>
                </button>
                 <button type="button" onClick={() => setFormData({...formData, role: 'official'})} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'official' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Shield className={`w-8 h-8 mb-2 ${formData.role === 'official' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-semibold">Official</span>
                </button>
              </div>

              {/* Common Fields */}
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
               <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input type="email" name="email" placeholder="Email Address" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" onChange={handleInputChange} required className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${passwordStrength < 3 ? 'bg-red-500' : passwordStrength < 5 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${passwordStrength * 20}%`}}></div>
              </div>

              {/* Official-Specific Fields */}
              {formData.role === 'official' && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  <div className="relative">
                    <Building className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                    <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <option value="" disabled>Select Department</option>
                      {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Award className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                    <input type="text" name="designation" placeholder="Designation (e.g., Manager)" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                  </div>
                   <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                    <input type="text" name="location" placeholder="Location (e.g., City, State)" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              )}

              {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</p>}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Creating your account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-6 h-6 mr-2" />
                    Create Account
                  </div>
                )}
              </button>

              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-lg">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 hover:underline-offset-2 transition-all duration-200"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;