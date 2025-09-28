// Exact path of file: frontend/src/pages/Profile.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, ArrowLeft, Edit, Save, X, LogOut, Loader2 } from 'lucide-react';

/**
 * Profile Component
 * Allows the citizen user to view and update their profile details.
 */
const Profile = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-10 text-red-500">User data not loaded. Please log in.</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    setIsSaving(true);

    if (!name.trim() || !email.trim()) {
        setLocalError("Name and Email cannot be empty.");
        setIsSaving(false);
        return;
    }

    try {
        // --- Simulate API Update Call ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app: call API to update user info, then update AuthContext state.
        // For mock: just simulate success and reset state.
        
        setIsEditing(false);
        setLocalSuccess("Profile updated successfully!");

        // In a real app, you would update the user object in AuthContext here:
        // user.name = name;
        // user.email = email;

    } catch (err) {
        setLocalError(err.message || "Failed to update profile. Please try again.");
    } finally {
        setIsSaving(false);
        setTimeout(() => setLocalSuccess(null), 3000); // Clear success message
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(false);
    setLocalError(null);
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-start space-x-4 mb-8">
            <button
                onClick={() => navigate('/citizen-dashboard')}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className='flex-1'>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <User className="w-7 h-7 mr-3 text-yellow-600" />
                    My Profile
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage your personal information and account settings.
                </p>
            </div>
        </div>

        {/* Status Messages */}
        {localError && (
            <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg" role="alert">
                {localError}
            </div>
        )}
        {localSuccess && (
            <div className="p-3 mb-4 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg" role="alert">
                {localSuccess}
            </div>
        )}
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing || isSaving}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm ${
                                isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditing || isSaving}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm ${
                                isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                    </div>
                </div>

                {/* Role Field (Read-only) */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        Account Role
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={user.role === 'citizen' ? 'Citizen Reporter' : 'Government Official'}
                            disabled
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg shadow-sm text-gray-600 font-medium"
                        />
                    </div>
                </div>
                
                {/* Action Buttons (Only visible in edit mode) */}
                {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
                            disabled={isSaving}
                        >
                            <X className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center space-x-1 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 mr-1 animate-spin" /> : <Save className="w-5 h-5 mr-1" />}
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                )}
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500">Need to sign out?</p>
                <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition duration-150"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;