import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircleIcon, ListPlusIcon, CalendarPlusIcon, BarChartIcon, UsersIcon, Brain } from 'lucide-react';
export const QuickActions: React.FC = () => {
  const actions = [{
    name: 'Schedule',
    icon: <CalendarPlusIcon size={20} className="text-white" />,
    link: '/schedule'
  }, {
    name: 'Team',
    icon: <UsersIcon size={20} className="text-white" />,
    link: '/collaborators'
  }];
  return <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => <Link key={index} to={action.link} className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center mb-1">
            {action.icon}
          </div>
          <span className="text-xs text-gray-600 text-center whitespace-pre-line">
            {action.name}
          </span>
        </Link>)}
    </div>;
};