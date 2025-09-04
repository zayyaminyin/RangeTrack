import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SunIcon, CloudIcon, CloudRainIcon, DropletIcon, ThermometerIcon, CalendarIcon, BarChart3Icon } from 'lucide-react';
import { Task, Resource, WeatherData } from '../../types';
import { getTodaysTasks, calculateFeedDaysRemaining, getUpcomingTasks } from '../../utils/calculations';
import { MetricCards } from './MetricCards';
import { TaskList } from './TaskList';
import { WeatherForecast } from './WeatherForecast';
import { TaskCompletionChart } from './TaskCompletionChart';
import { QuickActions } from './QuickActions';
interface DashboardProps {
  tasks: Task[];
  resources: Resource[];
  onCompleteTask: (taskId: string) => void;
}
export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  resources,
  onCompleteTask
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showWeatherForecast, setShowWeatherForecast] = useState(false);
  const todaysTasks = getTodaysTasks(tasks);
  const upcomingTasks = getUpcomingTasks(tasks, 3); // Get tasks for next 3 days
  // Simulate fetching weather data
  useEffect(() => {
    // In a real app, this would be an API call
    const mockWeather: WeatherData = {
      temp: 72,
      condition: 'Partly Cloudy',
      icon: 'cloud-sun',
      humidity: 45,
      wind: 8,
      precipitation: 20
    };
    setTimeout(() => {
      setWeather(mockWeather);
    }, 500);
  }, []);
  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return <SunIcon className="text-yellow-500" />;
    switch (weather.icon) {
      case 'cloud-rain':
        return <CloudRainIcon className="text-blue-500" />;
      case 'cloud':
        return <CloudIcon className="text-gray-500" />;
      default:
        return <SunIcon className="text-yellow-500" />;
    }
  };
  const feedDaysRemaining = calculateFeedDaysRemaining(tasks, resources);
  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-800 tracking-tight">Daily Dashboard</h1>
        <Link to="/task/add" className="btn-primary rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          <PlusIcon size={24} />
        </Link>
      </div>

      {/* Weather Widget - Enhanced */}
      <div className="card shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="p-6 flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            <div className="text-4xl mr-4">{getWeatherIcon()}</div>
            <div>
              <p className="font-medium text-gray-600">Today's Weather</p>
              {weather ? <>
                  <p className="text-2xl font-bold">{weather.temp}°F</p>
                  <p className="text-sm text-gray-600">{weather.condition}</p>
                </> : <p className="text-sm text-gray-600">Loading weather...</p>}
            </div>
          </div>
          {weather && <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <DropletIcon size={16} className="text-blue-500 mb-1" />
                <span className="text-xs text-gray-500">Humidity</span>
                <span className="text-sm font-medium">{weather.humidity}%</span>
              </div>
              <div className="flex flex-col items-center">
                <ThermometerIcon size={16} className="text-red-500 mb-1" />
                <span className="text-xs text-gray-500">Precip</span>
                <span className="text-sm font-medium">
                  {weather.precipitation}%
                </span>
              </div>
            </div>}
        </div>
        {/* Expandable Weather Forecast */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={() => setShowWeatherForecast(!showWeatherForecast)} 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center w-full justify-center transition-colors duration-200 font-medium"
          >
            {showWeatherForecast ? 'Hide forecast' : 'Show 5-day forecast'}
          </button>
        </div>
        {showWeatherForecast && <WeatherForecast />}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* AI Smart Recommendations */}
      <div className="card shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🤖</div>
              <h2 className="font-semibold text-gray-800">FarmAI Recommendations</h2>
            </div>
            <Link to="/ai" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Ask FarmAI →
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {(() => {
              const recommendations = [];
              
              // Feed recommendation
              if (feedDaysRemaining <= 7) {
                recommendations.push({
                  icon: '🌾',
                  text: `Your feed supply is low (${feedDaysRemaining} days left). Consider ordering more feed or ask me about feed alternatives.`,
                  priority: 'high'
                });
              }
              
              // Health check recommendation
              const lowHealthResources = resources.filter(r => r.health && r.health < 80);
              if (lowHealthResources.length > 0) {
                recommendations.push({
                  icon: '🏥',
                  text: `${lowHealthResources.length} resource(s) show health concerns. Ask me about care recommendations.`,
                  priority: 'medium'
                });
              }
              
              // Weather-based recommendation
              recommendations.push({
                icon: '🌤️',
                text: 'Based on today\'s weather, ask me about optimal timing for outdoor tasks.',
                priority: 'low'
              });
              
              // Task optimization
              const incompleteTasks = tasks.filter(t => !t.completed);
              if (incompleteTasks.length > 5) {
                recommendations.push({
                  icon: '📋',
                  text: `You have ${incompleteTasks.length} pending tasks. Ask me to help prioritize your workload.`,
                  priority: 'medium'
                });
              }
              
              // Equipment maintenance
              const equipment = resources.filter(r => r.type === 'equipment');
              if (equipment.length > 0) {
                recommendations.push({
                  icon: '🔧',
                  text: 'Ask me about seasonal maintenance schedules for your equipment.',
                  priority: 'low'
                });
              }
              
              // Default recommendation if no specific ones
              if (recommendations.length === 0) {
                recommendations.push({
                  icon: '💡',
                  text: 'Ask me anything about farming best practices, animal care, or equipment maintenance!',
                  priority: 'low'
                });
              }
              
              return recommendations.slice(0, 2); // Show max 2 recommendations
            })().map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                rec.priority === 'medium' ? 'bg-amber-50 border-amber-400' :
                'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{rec.icon}</span>
                  <p className="text-sm text-gray-700 flex-1">{rec.text}</p>
                </div>
              </div>
            ))}
            
            <Link 
              to="/ai" 
              className="block w-full text-center bg-primary-100 hover:bg-primary-200 text-primary-800 py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              🧠 Chat with FarmAI Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Task Completion Progress */}
      <div className="card shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Task Completion Progress</h2>
            <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium">
              View all →
            </Link>
          </div>
        </div>
        <div className="card-body">
          <TaskCompletionChart tasks={tasks} />
        </div>
      </div>

      {/* Quick Insights */}
      {feedDaysRemaining <= 14 && (
        <div className={`card shadow-md p-4 border-l-4 animate-slide-up ${
          feedDaysRemaining <= 7 
            ? 'bg-red-50 border-red-400 text-red-800' 
            : 'bg-yellow-50 border-yellow-400 text-yellow-800'
        }`}>
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <p className="font-semibold text-sm">
                {feedDaysRemaining === 0 ? 'Feed Stock Alert' : 'Low Feed Stock Warning'}
              </p>
              <p className="text-xs mt-1">
                {feedDaysRemaining === 0 
                  ? 'Your feed stock is completely depleted!' 
                  : `Feed stock will last ${feedDaysRemaining} more day${feedDaysRemaining !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <MetricCards resources={resources} />

      {/* Today's Tasks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-800 tracking-tight">
            Today's Tasks
          </h2>
          <Link to="/task/add" className="btn-primary text-sm px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200">
            + Add Task
          </Link>
        </div>
        
        {todaysTasks.length === 0 ? (
          <div className="card shadow-md text-center">
            <div className="card-body py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks logged today</h3>
              <p className="text-gray-600 mb-6">Start tracking your farm activities</p>
              <Link to="/task/add" className="btn-primary shadow-md hover:shadow-lg transition-all duration-200">
                Log Your First Task
              </Link>
            </div>
          </div>
        ) : (
          <TaskList tasks={todaysTasks} resources={resources} onCompleteTask={onCompleteTask} />
        )}
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center">
            <CalendarIcon size={20} className="text-primary-700 mr-3" />
            <h2 className="text-2xl font-bold text-primary-800 tracking-tight">
              Upcoming Tasks
            </h2>
          </div>
          <div className="card shadow-md divide-y divide-gray-100">
            {upcomingTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTaskTypeEmoji(task.type)}</div>
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">
                        {task.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(task.ts).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/task/${task.id}`} 
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farm Analytics Preview */}
      <div className="card shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart3Icon size={22} className="text-primary-700 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Farm Analytics</h2>
            </div>
            <Link to="/insights" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Full Report →
            </Link>
          </div>
        </div>
        <div className="card-body">
          {/* Quick Analytics Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Task Completion Rate */}
            <div className="bg-primary-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-primary-800">Task Completion</p>
                  <p className="text-xs text-primary-600">Last 7 days</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-800 mb-2">
                  {(() => {
                    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    const recentTasks = tasks.filter(task => task.ts >= oneWeekAgo);
                    const completedTasks = recentTasks.filter(task => task.completed);
                    return recentTasks.length > 0 ? Math.round((completedTasks.length / recentTasks.length) * 100) : 0;
                  })()}%
                </p>
                <div className="w-full bg-primary-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(() => {
                        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                        const recentTasks = tasks.filter(task => task.ts >= oneWeekAgo);
                        const completedTasks = recentTasks.filter(task => task.completed);
                        return recentTasks.length > 0 ? Math.round((completedTasks.length / recentTasks.length) * 100) : 0;
                      })()}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Feed Status */}
            <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Feed Inventory</p>
                  <p className="text-xs text-gray-600">Days remaining</p>
                </div>
                <div className="text-2xl">🌾</div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold mb-1 ${
                  feedDaysRemaining <= 7 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {feedDaysRemaining}
                </p>
                <p className="text-xs text-gray-600">days left</p>
              </div>
            </div>

            {/* Resource Health */}
            <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Resource Health</p>
                  <p className="text-xs text-gray-600">Average condition</p>
                </div>
                <div className="text-2xl">🏥</div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {(() => {
                    const animals = resources.filter(r => r.type === 'animal' && r.health !== undefined);
                    const equipment = resources.filter(r => r.type === 'equipment' && r.health !== undefined);
                    const allWithHealth = [...animals, ...equipment];
                    if (allWithHealth.length === 0) return 'N/A';
                    const avgHealth = allWithHealth.reduce((sum, r) => sum + (r.health || 0), 0) / allWithHealth.length;
                    return `${Math.round(avgHealth)}%`;
                  })()}
                </p>
                <p className="text-xs text-gray-600">overall health</p>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-primary-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-primary-800">Recent Activity</p>
                  <p className="text-xs text-primary-600">Tasks this week</p>
                </div>
                <div className="text-2xl">⚡</div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-800 mb-1">
                  {(() => {
                    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    return tasks.filter(task => task.ts >= oneWeekAgo).length;
                  })()}
                </p>
                <p className="text-xs text-primary-600">tasks logged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Helper function to get emoji for task type
const getTaskTypeEmoji = (type: string): string => {
  switch (type) {
    case 'feeding':
      return '🍽️';
    case 'watering':
      return '💧';
    case 'herd_move':
      return '🐄';
    case 'repair':
      return '🔧';
    case 'harvest':
      return '🌾';
    default:
      return '📝';
  }
};