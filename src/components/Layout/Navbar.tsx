import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, PackageIcon, AwardIcon, ClockIcon } from 'lucide-react';
export const Navbar = () => {
  const location = useLocation();
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
  }];
  return <nav className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">
            RangeTrack
          </Link>
          <div className="hidden md:block">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`px-3 py-2 rounded-md mx-1 ${location.pathname === item.path ? 'bg-green-700' : 'hover:bg-green-700'}`}>
                {item.label}
              </Link>)}
          </div>
        </div>
      </div>
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 border-t border-green-700 flex justify-around z-10">
        {navItems.map(item => <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 flex-1 ${location.pathname === item.path ? 'bg-green-700' : ''}`}>
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>)}
      </div>
    </nav>;
};