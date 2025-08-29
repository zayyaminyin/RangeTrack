import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, PackageIcon, AwardIcon, ClockIcon, LogOutIcon, UserIcon, ChevronDownIcon, EditIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    location: user?.location || ''
  });
  const [updating, setUpdating] = useState(false);
  
  const navItems = [{
    path: '/',
    icon: <HomeIcon size={20} />,
    label: 'Home'
  }, {
    path: '/task/add',
    icon: <ClipboardListIcon size={20} />,
    label: 'Add Task'
  }, {
    path: '/resources',
    icon: <PackageIcon size={20} />,
    label: 'Resources'
  }, {
    path: '/insights',
    icon: <AwardIcon size={20} />,
    label: 'Insights'
  }, {
    path: '/history',
    icon: <ClockIcon size={20} />,
    label: 'History'
  }, {
    path: '/profile',
    icon: <UserIcon size={20} />,
    label: 'Profile'
  }];

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setUpdating(true);
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
        alert('Failed to update profile');
      } else {
        alert('Profile updated successfully! Please refresh the page to see changes.');
        setShowProfileEdit(false);
        setShowUserMenu(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return <nav className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">
            RangeTrack
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`px-3 py-2 rounded-md ${location.pathname === item.path ? 'bg-green-700' : 'hover:bg-green-700'}`}>
                {item.label}
              </Link>)}
            
            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-700 bg-red-600 text-white"
              title="Sign Out"
            >
              <LogOutIcon size={16} />
              <span className="text-sm">Logout</span>
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-700"
              >
                <UserIcon size={16} />
                <span className="text-sm">{user?.name}</span>
                <ChevronDownIcon size={16} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-20">
                  {!showProfileEdit ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-gray-500">{user?.location}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileData({ name: user?.name || '', location: user?.location || '' });
                          setShowProfileEdit(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <EditIcon size={16} className="mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOutIcon size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Edit Profile</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Farm Location
                          </label>
                          <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Your farm location"
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={handleProfileUpdate}
                            disabled={updating}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs py-1 px-2 rounded"
                          >
                            {updating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setShowProfileEdit(false)}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs py-1 px-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 border-t border-green-700 flex justify-around z-10">
        {navItems.map(item => <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 flex-1 ${location.pathname === item.path ? 'bg-green-700' : ''}`}>
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>)}
        
        {/* Mobile Logout Button */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center p-2 flex-1 bg-red-600 hover:bg-red-700"
          title="Sign Out"
        >
          <LogOutIcon size={20} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>;
};