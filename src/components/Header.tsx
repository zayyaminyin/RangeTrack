import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
export const Header: React.FC = () => {
  const {
    user
  } = useApp();
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/add-task':
        return 'Add Task';
      case '/resources':
        return 'Resources';
      case '/insights':
        return 'Insights & Awards';
      case '/history':
        return 'History';
      default:
        return 'RangeTrack';
    }
  };
  return <header className="bg-green-700 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
          <p className="text-sm text-green-100">{user.location}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>;
};