import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Award,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, changeMyPassword, getMyStats } from '../services/apiServices';

// Custom navigation function
const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch real stats when the component loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getMyStats();
        setUserStats(statsData.stats);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };
    if (user) {
        fetchStats();
        // Update form with latest user data from context
        setProfileForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || ''
        });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyProfile(profileForm);
      alert('Profile updated successfully!');
      setIsEditing(false);
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Profile update failed:', error);
      alert(`Error updating profile: ${error.error || 'Please try again.'}`);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      alert('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change failed:', error);
      alert(`Error changing password: ${error.error || 'Please check your current password and try again.'}`);
    }
  };

  const handleCancel = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/citizen')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" name="name" id="name" value={profileForm.name} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" name="email" id="email" value={profileForm.email} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" disabled/>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" name="phone" id="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., +1 123 456 7890"/>
                    </div>
                     <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" name="location" id="location" value={profileForm.location} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., San Francisco, CA"/>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" id="bio" rows="3" value={profileForm.bio} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Tell us a little about yourself"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm flex items-center"><X className="w-4 h-4 mr-2"/>Cancel</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm flex items-center"><Save className="w-4 h-4 mr-2"/>Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{profileForm.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                       <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">{profileForm.email || 'Not provided'}</p>
                      </div>
                    </div>
                     <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                       <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{profileForm.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{profileForm.location || 'Not provided'}</p>
                      </div>
                    </div>
                     <div className="flex items-start">
                        <User className="w-5 h-5 text-gray-400 mr-4 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500">Bio</p>
                            <p className="font-medium text-gray-900 whitespace-pre-wrap">{profileForm.bio || 'Not provided'}</p>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              </div>
              <div className="p-6">
                {!showPasswordForm ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-500 mt-1">It's a good idea to use a strong password that you're not using elsewhere.</p>
                    </div>
                    <button onClick={() => setShowPasswordForm(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm">Change</button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                        {showCurrentPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                      </button>
                    </div>
                     <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                       <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                        {showNewPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                      </button>
                    </div>
                     <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                       <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                      </button>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                       <button type="button" onClick={() => setShowPasswordForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm">Cancel</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm">Update Password</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {userStats ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reports Submitted</span>
                    <span className="font-medium text-gray-900">{userStats.reportsSubmitted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Issues Resolved</span>
                    <span className="font-medium text-green-600">{userStats.reportsResolved}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-medium text-purple-600">{userStats.reportsInProgress}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-blue-600">{userStats.reportsNew}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                Loading stats...
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Badges (Coming Soon)</span>
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Recent Activity (Coming Soon)</span>
              </h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;