import React, { useState } from 'react';
import { Task, Resource, Award } from '../../types';
import { calculateFeedDaysRemaining, calculateEquipmentUptime, calculateCompletionRate } from '../../utils/calculations';
import { AwardsList } from './AwardsList';
import { TasksChart } from './TasksChart';
import { ResourceUsageChart } from './ResourceUsageChart';
import { ChartBarIcon, AwardIcon, LightbulbIcon, ClipboardIcon } from 'lucide-react';
interface InsightsProps {
  tasks: Task[];
  resources: Resource[];
  awards: Award[];
}
export const Insights: React.FC<InsightsProps> = ({
  tasks,
  resources,
  awards
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'tasks' | 'resources' | 'awards'>('insights');
  // Generate insights based on data
  const generateInsights = () => {
    const insights = [];
    // Feed days remaining
    const feedDaysRemaining = calculateFeedDaysRemaining(tasks, resources);
    if (feedDaysRemaining <= 30) {
      insights.push({
        id: 'feed_remaining',
        icon: '📊',
        title: 'Feed Inventory',
        description: feedDaysRemaining === 0 ? 'Feed stock depleted! Time to restock.' : `Feed projected to run out in ${feedDaysRemaining} days.`,
        severity: feedDaysRemaining <= 7 ? 'high' : 'medium'
      });
    }
    // Equipment uptime
    const equipment = resources.filter(r => r.type === 'equipment');
    equipment.forEach(item => {
      const uptime = calculateEquipmentUptime(tasks, item.id);
      if (uptime < 90) {
        insights.push({
          id: `equipment_${item.id}`,
          icon: '🔧',
          title: `${item.name} Status`,
          description: `${uptime.toFixed(0)}% uptime. May need maintenance.`,
          severity: uptime < 75 ? 'high' : 'medium'
        });
      }
    });
    // Task completion rate
    const completionRate = calculateCompletionRate(tasks);
    if (completionRate < 80) {
      insights.push({
        id: 'task_completion',
        icon: '📋',
        title: 'Task Completion',
        description: `${completionRate.toFixed(0)}% of tasks completed in the last week.`,
        severity: completionRate < 50 ? 'high' : 'medium'
      });
    }
    // Task frequency
    const taskTypes = ['feeding', 'watering', 'herd_move', 'repair', 'harvest'];
    const taskCounts = taskTypes.reduce((acc, type) => {
      acc[type] = tasks.filter(t => t.type === type).length;
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentTask = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostFrequentTask && mostFrequentTask[1] > 0) {
      insights.push({
        id: 'task_frequency',
        icon: '📈',
        title: 'Activity Insights',
        description: `Your most frequent task is ${formatTaskType(mostFrequentTask[0])} (${mostFrequentTask[1]} times).`,
        severity: 'low'
      });
    }
    return insights;
  };
  const insights = generateInsights();
  const completionRate = calculateCompletionRate(tasks);
  return <div className="pb-16">
      <h1 className="text-2xl font-bold text-green-800 mb-4">
        Insights & Analytics
      </h1>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('insights')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'insights' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <div className="flex items-center">
            <LightbulbIcon size={16} className="mr-1" />
            Insights
          </div>
        </button>
        <button onClick={() => setActiveTab('tasks')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <div className="flex items-center">
            <ClipboardIcon size={16} className="mr-1" />
            Tasks
          </div>
        </button>
        <button onClick={() => setActiveTab('resources')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'resources' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <div className="flex items-center">
            <ChartBarIcon size={16} className="mr-1" />
            Resources
          </div>
        </button>
        <button onClick={() => setActiveTab('awards')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'awards' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <div className="flex items-center">
            <AwardIcon size={16} className="mr-1" />
            Awards
          </div>
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === 'insights' && <>
          {/* Task Completion Rate */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Task Completion
            </h2>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-green-600">
                  {completionRate.toFixed(0)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  You've completed {completionRate.toFixed(0)}% of your tasks in
                  the last 7 days
                </p>
                {completionRate < 70 ? <p className="text-xs text-orange-600 mt-1">
                    Try to improve your completion rate!
                  </p> : <p className="text-xs text-green-600 mt-1">
                    Great job staying on top of your tasks!
                  </p>}
              </div>
            </div>
          </div>
          {/* Insights Cards */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-green-700 mb-3">
              Farm Insights
            </h2>
            {insights.length > 0 ? <div className="space-y-3">
                {insights.map(insight => <div key={insight.id} className={`p-4 rounded-lg ${insight.severity === 'high' ? 'bg-red-100 text-red-800' : insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    <div className="flex items-start">
                      <span className="text-xl mr-3">{insight.icon}</span>
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <p>{insight.description}</p>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                <p>No insights available yet</p>
                <p className="text-sm">
                  Log more activities to generate insights
                </p>
              </div>}
          </section>
        </>}
      {activeTab === 'tasks' && <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Task Analytics
          </h2>
          <TasksChart tasks={tasks} />
        </div>}
      {activeTab === 'resources' && <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Resource Usage
          </h2>
          <ResourceUsageChart tasks={tasks} resources={resources} />
        </div>}
      {activeTab === 'awards' && <section>
          <h2 className="text-lg font-semibold text-green-700 mb-3">
            Your Awards
          </h2>
          <AwardsList awards={awards} />
        </section>}
    </div>;
};
// Helper function to format task type
const formatTaskType = (type: string): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};