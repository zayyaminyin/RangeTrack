import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, PackageIcon, AwardIcon, ClockIcon, LogOutIcon, UserIcon, ChevronDownIcon, EditIcon, Brain, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDemo } from '../../context/DemoContext';
import { supabase } from '../../lib/supabase';

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isDemoMode, demoUser, exitDemoMode } = useDemo();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: (isDemoMode ? demoUser.name : user?.name) || '',
    location: (isDemoMode ? demoUser.location : user?.location) || ''
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
    path: '/ai',
    icon: <Brain size={20} />,
    label: 'FarmAI'
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

  return (
    <>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Demo Mode - Exploring sample farm data</span>
            <button 
              onClick={exitDemoMode}
              className="ml-4 text-blue-100 hover:text-white transition-colors duration-200"
              title="Exit Demo Mode"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <nav className="bg-primary-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="font-bold text-2xl tracking-tight hover:text-primary-100 transition-colors duration-200">
              🌾 RangeTrack {isDemoMode && <span className="text-xs font-normal ml-2 bg-blue-500 px-2 py-1 rounded">DEMO</span>}
            </Link>
            
            {/* Mobile logout button */}
            <button
              onClick={handleSignOut}
              className="md:hidden p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              title="Sign Out"
            >
              <LogOutIcon size={16} />
            </button>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    location.pathname === item.path 
                      ? 'bg-primary-700 text-white shadow-md' 
                      : 'hover:bg-primary-700 hover:shadow-md text-primary-100 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* User Menu */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 bg-primary-700/50 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-white">
                      {isDemoMode ? demoUser.name : user?.name}
                      {isDemoMode && <span className="text-xs ml-1 text-blue-200">(Demo)</span>}
                    </p>
                    <p className="text-xs text-primary-200">
                      {isDemoMode ? demoUser.location : (user?.location || 'Farm Owner')}
                    </p>
                  </div>
                  <ChevronDownIcon size={16} className="text-primary-200" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100 animate-fade-in">
                    {!showProfileEdit ? (
                      <>
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
                              <UserIcon size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {isDemoMode ? demoUser.name : user?.name}
                                {isDemoMode && <span className="text-xs ml-1 text-blue-600">(Demo User)</span>}
                              </p>
                              <p className="text-sm text-gray-600">
                                {isDemoMode ? demoUser.email : user?.email}
                              </p>
                              {(isDemoMode ? demoUser.location : user?.location) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📍 {isDemoMode ? demoUser.location : user?.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setProfileData({ name: user?.name || '', location: user?.location || '' });
                              setShowProfileEdit(true);
                            }}
                            className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                          >
                            <EditIcon size={16} className="mr-3 text-primary-600" />
                            <span className="font-medium">Edit Profile</span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-6 py-3 text-sm text-red-700 hover:bg-red-50 flex items-center transition-colors duration-200"
                          >
                            <LogOutIcon size={16} className="mr-3 text-red-600" />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <EditIcon size={16} className="mr-2 text-primary-600" />
                          Edit Profile
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="input-field text-sm"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Farm Location
                            </label>
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              className="input-field text-sm"
                              placeholder="Your farm location"
                            />
                          </div>
                          <div className="flex space-x-3 pt-2">
                            <button
                              onClick={handleProfileUpdate}
                              disabled={updating}
                              className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
                            >
                              {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                              onClick={() => setShowProfileEdit(false)}
                              className="btn-secondary flex-1 text-sm py-2"
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
      </nav>

      {/* Mobile bottom navigation - Compact single row */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-800 border-t border-primary-700 z-50 shadow-lg">
        <div className="grid grid-cols-6 gap-0 p-2">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
                location.pathname === item.path 
                  ? 'bg-primary-600 text-white' 
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0 mb-1">
                {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
              </div>
              <span className="text-[10px] text-center leading-tight font-medium">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Add bottom padding for mobile to account for fixed navigation */}
      <div className="md:hidden h-16"></div>
    </>
  );
};