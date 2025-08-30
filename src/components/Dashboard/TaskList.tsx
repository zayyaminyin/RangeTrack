import React from 'react';
import { Task, Resource } from '../../types';
import { CheckCircleIcon } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  resources: Resource[];
  onCompleteTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  resources,
  onCompleteTask
}) => {
  // Get resource name by ID
  const getResourceName = (id?: string) => {
    if (!id) return 'N/A';
    const resource = resources.find(r => r.id === id);
    return resource ? resource.name : 'Unknown';
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon based on task type
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'feeding':
        return '🍽️ Feeding';
      case 'watering':
        return '💧 Watering';
      case 'herd_move':
        return '🐄 Herd Move';
      case 'repair':
        return '🔧 Repair';
      case 'harvest':
        return '🌾 Harvest';
      default:
        return '📝 Other';
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div key={task.id} className={`bg-white rounded-lg shadow p-3 ${task.completed ? 'opacity-75' : ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className={`mr-3 p-1 rounded-full transition-colors ${
                    task.completed 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <CheckCircleIcon size={16} />
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {getTaskTypeLabel(task.type)}
                  </p>
                  {task.resource_id && (
                    <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getResourceName(task.resource_id)}
                      {task.qty && ` - ${task.qty} units`}
                    </p>
                  )}
                  {task.notes && (
                    <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : ''}`}>
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <span className={`text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatTime(task.ts)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};