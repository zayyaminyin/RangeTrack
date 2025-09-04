import React from 'react';
import { Task } from '../../types';
interface TaskCompletionChartProps {
  tasks: Task[];
}
export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({
  tasks
}) => {
  // Get tasks from the last 7 days
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentTasks = tasks.filter(task => task.ts >= oneWeekAgo);
  // Group by day and count
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: {
    day: string;
    count: number;
    completed: number;
  }[] = [];
  // Initialize array with past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dayName = dayNames[date.getDay()];
    dayStats.push({
      day: dayName,
      count: 0,
      completed: 0
    });
  }
  // Fill in task counts
  recentTasks.forEach(task => {
    const taskDate = new Date(task.ts);
    const dayIndex = dayNames.indexOf(dayNames[taskDate.getDay()]);
    // Find the right day in our stats array
    const statsIndex = dayStats.findIndex(stat => stat.day === dayNames[taskDate.getDay()]);
    if (statsIndex !== -1) {
      dayStats[statsIndex].count++;
      if (task.completed) {
        dayStats[statsIndex].completed++;
      }
    }
  });
  // Calculate max count for scaling
  const maxCount = Math.max(...dayStats.map(day => day.count), 3); // Minimum of 3 for scale
  return <div className="h-32">
      <div className="flex h-full items-end">
        {dayStats.map((day, index) => <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
            {/* Bar chart */}
            <div className="w-full px-1 flex flex-col items-center justify-end h-[80%]">
              {day.count > 0 ? <>
                  <div className="w-full bg-green-200 rounded-t" style={{
              height: `${day.completed / maxCount * 100}%`,
              minHeight: day.completed > 0 ? '4px' : '0'
            }}></div>
                  <div className="w-full bg-gray-200" style={{
              height: `${(day.count - day.completed) / maxCount * 100}%`,
              minHeight: day.count - day.completed > 0 ? '4px' : '0'
            }}></div>
                </> : <div className="w-full border-b border-dashed border-gray-300"></div>}
            </div>
            {/* Day label */}
            <p className="text-xs font-medium text-gray-600 mt-2">{day.day}</p>
            {/* Count */}
            <p className="text-xs text-gray-500">{day.count}</p>
          </div>)}
      </div>
    </div>;
};