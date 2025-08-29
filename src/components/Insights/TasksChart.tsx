import React from 'react';
import { Task } from '../../types';
interface TasksChartProps {
  tasks: Task[];
}
export const TasksChart: React.FC<TasksChartProps> = ({
  tasks
}) => {
  // Group tasks by type
  const taskTypes = ['feeding', 'watering', 'herd_move', 'repair', 'harvest', 'health_check', 'vaccination', 'maintenance', 'other'];
  const taskCounts = taskTypes.reduce((acc, type) => {
    acc[type] = tasks.filter(task => task.type === type).length;
    return acc;
  }, {} as Record<string, number>);
  // Sort by count
  const sortedTaskTypes = [...taskTypes].sort((a, b) => taskCounts[b] - taskCounts[a]);
  // Find max count for scaling
  const maxCount = Math.max(...Object.values(taskCounts), 1);
  // Format task type for display
  const formatTaskType = (type: string): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  // Get color for task type
  const getTaskColor = (type: string): string => {
    switch (type) {
      case 'feeding':
        return 'bg-amber-500';
      case 'watering':
        return 'bg-blue-500';
      case 'herd_move':
        return 'bg-purple-500';
      case 'repair':
        return 'bg-red-500';
      case 'harvest':
        return 'bg-green-500';
      case 'health_check':
        return 'bg-teal-500';
      case 'vaccination':
        return 'bg-indigo-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  return <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-2">Tasks by Type</p>
        <div className="space-y-2">
          {sortedTaskTypes.map(type => taskCounts[type] > 0 && <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{formatTaskType(type)}</span>
                    <span className="font-medium">{taskCounts[type]}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${getTaskColor(type)} h-2 rounded-full`} style={{
              width: `${taskCounts[type] / maxCount * 100}%`
            }}></div>
                  </div>
                </div>)}
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-2">Task Completion Status</p>
        <div className="flex justify-center">
          <div className="w-32 h-32 relative">
            {/* This would be a proper pie chart in a real implementation */}
            <div className="absolute inset-0 rounded-full border-8 border-green-500 border-r-gray-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(tasks.filter(t => t.completed).length / Math.max(tasks.length, 1) * 100)}
                  %
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};