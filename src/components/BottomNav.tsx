import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, LayersIcon, AwardIcon, ClockIcon } from 'lucide-react';
export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-green-600' : 'text-gray-500';
  };
  return <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-2">
      <div className="container mx-auto flex justify-between px-6">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <HomeIcon size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/add-task" className={`flex flex-col items-center ${isActive('/add-task')}`}>
          <PlusCircleIcon size={24} />
          <span className="text-xs mt-1">Add Task</span>
        </Link>
        <Link to="/resources" className={`flex flex-col items-center ${isActive('/resources')}`}>
          <LayersIcon size={24} />
          <span className="text-xs mt-1">Resources</span>
        </Link>
        <Link to="/insights" className={`flex flex-col items-center ${isActive('/insights')}`}>
          <AwardIcon size={24} />
          <span className="text-xs mt-1">Insights</span>
        </Link>
        <Link to="/history" className={`flex flex-col items-center ${isActive('/history')}`}>
          <ClockIcon size={24} />
          <span className="text-xs mt-1">History</span>
        </Link>
      </div>
    </nav>;
};