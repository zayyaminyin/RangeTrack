import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarPlusIcon, 
  UsersIcon, 
  CameraIcon, 
  CloudIcon, 
  FileTextIcon,
  MapIcon
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'Schedule',
      icon: <CalendarPlusIcon size={20} className="text-white" />,
      link: '/schedule'
    }, 
    {
      name: 'Team',
      icon: <UsersIcon size={20} className="text-white" />,
      link: '/collaborators'
    },
    {
      name: 'Gallery',
      icon: <CameraIcon size={20} className="text-white" />,
      link: '/gallery'
    },
    {
      name: 'Weather',
      icon: <CloudIcon size={20} className="text-white" />,
      link: '/weather'
    },
    {
      name: 'Reports',
      icon: <FileTextIcon size={20} className="text-white" />,
      link: '/reports'
    },
    {
      name: 'Map',
      icon: <MapIcon size={20} className="text-white" />,
      link: '/map'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Link 
          key={index} 
          to={action.link} 
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center mb-2 transition-all duration-200 group-hover:scale-105 shadow-md group-hover:shadow-lg">
            {action.icon}
          </div>
          <span className="text-xs text-gray-600 text-center font-medium group-hover:text-green-600 transition-colors duration-200">
            {action.name}
          </span>
        </Link>
      ))}
    </div>
  );
};