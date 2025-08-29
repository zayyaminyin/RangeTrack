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
}
export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  resources
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
  return <div className="space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">Daily Dashboard</h1>
        <Link to="/task/add" className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2">
          <PlusIcon size={24} />
        </Link>
      </div>

      {/* Weather Widget - Enhanced */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50">
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
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <button onClick={() => setShowWeatherForecast(!showWeatherForecast)} className="text-sm text-blue-600 flex items-center w-full justify-center">
            {showWeatherForecast ? 'Hide forecast' : 'Show 5-day forecast'}
          </button>
        </div>
        {showWeatherForecast && <WeatherForecast />}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Task Completion Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium text-gray-700">Task Completion</h2>
          <Link to="/history" className="text-xs text-green-600">
            View all
          </Link>
        </div>
        <TaskCompletionChart tasks={tasks} />
      </div>

      {/* Quick Insights */}
      {feedDaysRemaining <= 14 && <div className={`rounded-lg p-4 ${feedDaysRemaining <= 7 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <p className="font-medium">
            {feedDaysRemaining === 0 ? '⚠️ Feed stock depleted!' : `⚠️ Feed stock will last ${feedDaysRemaining} more day${feedDaysRemaining !== 1 ? 's' : ''}`}
          </p>
        </div>}

      {/* Metric Cards */}
      <MetricCards resources={resources} />

      {/* Today's Tasks */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-green-800">
            Today's Tasks
          </h2>
          <Link to="/task/add" className="text-green-600 text-sm">
            + Add Task
          </Link>
        </div>
        <TaskList tasks={todaysTasks} resources={resources} />
        {todaysTasks.length === 0 && <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            <p>No tasks logged today</p>
            <Link to="/task/add" className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm">
              Log Your First Task
            </Link>
          </div>}
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && <div>
          <div className="flex items-center mb-2">
            <CalendarIcon size={16} className="text-green-700 mr-2" />
            <h2 className="text-lg font-semibold text-green-800">
              Upcoming Tasks
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
            {upcomingTasks.map(task => <div key={task.id} className="p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {getTaskTypeEmoji(task.type)}{' '}
                      {task.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.ts).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
                    </p>
                  </div>
                  <Link to={`/task/${task.id}`} className="text-xs text-green-600">
                    View
                  </Link>
                </div>
              </div>)}
          </div>
        </div>}

      {/* Farm Analytics Preview */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <BarChart3Icon size={18} className="text-green-700 mr-2" />
            <h2 className="font-medium text-gray-700">Farm Analytics</h2>
          </div>
          <Link to="/insights" className="text-xs text-green-600">
            Full Report
          </Link>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800">
            View your farm's performance metrics and insights
          </p>
        </div>
      </div>
    </div>;
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