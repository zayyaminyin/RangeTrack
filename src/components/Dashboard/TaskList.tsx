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
    <div className="space-y-3">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`card shadow-md hover:shadow-lg transition-all duration-200 ${
            task.completed ? 'opacity-75 bg-gray-50' : 'hover:scale-[1.02]'
          }`}
        >
          <div className="card-body py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                      task.completed 
                        ? 'bg-primary-100 text-primary-600 hover:bg-primary-200 shadow-md' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <CheckCircleIcon size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-base ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}>
                      {getTaskTypeLabel(task.type)}
                    </p>
                    {task.resource_id && (
                      <div className={`flex items-center space-x-2 mt-1 ${
                        task.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className="text-sm">📦</span>
                        <p className="text-sm">
                          {getResourceName(task.resource_id)}
                          {task.qty && <span className="font-medium"> - {task.qty} units</span>}
                        </p>
                      </div>
                    )}
                    {task.notes && (
                      <div className={`flex items-start space-x-2 mt-2 ${
                        task.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className="text-sm mt-0.5">💬</span>
                        <p className="text-sm italic">{task.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <span className={`text-sm font-medium ${
                  task.completed ? 'text-gray-400' : 'text-primary-600'
                }`}>
                  {formatTime(task.ts)}
                </span>
                {task.completed && (
                  <div className="badge badge-success mt-1 text-xs">
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};