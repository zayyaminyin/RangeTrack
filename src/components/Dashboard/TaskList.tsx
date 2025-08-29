import React from 'react';
import { Task, Resource } from '../../types';
interface TaskListProps {
  tasks: Task[];
  resources: Resource[];
}
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  resources
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
  return <div className="space-y-2">
      {tasks.map(task => <div key={task.id} className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{getTaskTypeLabel(task.type)}</p>
              {task.resource_id && <p className="text-sm text-gray-600">
                  {getResourceName(task.resource_id)}
                  {task.qty && ` - ${task.qty} units`}
                </p>}
              {task.notes && <p className="text-sm mt-1">{task.notes}</p>}
            </div>
            <span className="text-xs text-gray-500">{formatTime(task.ts)}</span>
          </div>
        </div>)}
    </div>;
};