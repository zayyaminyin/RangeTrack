import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeftIcon, SaveIcon, Loader2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    location: ''
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          location: profileData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully! Please refresh the page to see changes.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link to="/" className="mr-4">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </Link>
            <h1 className="text-2xl font-bold text-green-800">Profile Settings</h1>
          </div>

          {/* Current User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-gray-900 mb-2">Current Profile</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Location:</span> {user.location}</p>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Farm/Ranch Location
              </label>
              <input
                id="location"
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Texas Ranch, California Farm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {updating ? (
                <>
                  <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-5 w-5" />
                  Update Profile
                </>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 Tip</h3>
            <p className="text-sm text-blue-700">
              After updating your profile, refresh the page to see your new name in the navigation bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
