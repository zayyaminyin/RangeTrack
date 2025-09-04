import React, { useState } from 'react';
import { Task } from '../../types';
import { CalendarIcon, FilterIcon, SearchIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
interface HistoryProps {
  tasks: Task[];
}
export const History: React.FC<HistoryProps> = ({
  tasks
}) => {
  const [filter, setFilter] = useState<'7days' | '30days' | 'all'>('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  // Filter tasks based on selected time range
  const getFilteredTasks = () => {
    const now = Date.now();
    // Start with time filter
    let filteredResults = tasks;
    if (filter === '7days') {
      filteredResults = filteredResults.filter(task => now - task.ts <= 7 * 24 * 60 * 60 * 1000);
    } else if (filter === '30days') {
      filteredResults = filteredResults.filter(task => now - task.ts <= 30 * 24 * 60 * 60 * 1000);
    }
    // Apply status filter
    if (statusFilter === 'completed') {
      filteredResults = filteredResults.filter(task => task.completed);
    } else if (statusFilter === 'pending') {
      filteredResults = filteredResults.filter(task => !task.completed);
    }
    // Apply date filter if selected
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      filteredResults = filteredResults.filter(task => {
        const taskDate = new Date(task.ts);
        return taskDate >= selectedDateObj && taskDate < nextDay;
      });
    }
    // Apply search query
    if (searchQuery) {
      filteredResults = filteredResults.filter(task => task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || task.type.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filteredResults;
  };
  // Group tasks by date
  const groupTasksByDate = (filteredTasks: Task[]) => {
    const groupedTasks: Record<string, Task[]> = {};
    filteredTasks.forEach(task => {
      const date = new Date(task.ts).toLocaleDateString();
      if (!groupedTasks[date]) {
        groupedTasks[date] = [];
      }
      groupedTasks[date].push(task);
    });
    // Sort dates in descending order
    return Object.entries(groupedTasks).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };
  const filteredTasks = getFilteredTasks();
  const groupedTasks = groupTasksByDate(filteredTasks);
  // Format task type for display
  const formatTaskType = (type: string) => {
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
      case 'health_check':
        return '🩺 Health Check';
      case 'vaccination':
        return '💉 Vaccination';
      case 'maintenance':
        return '🛠️ Maintenance';
      default:
        return '📝 Other';
    }
  };
  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Get priority badge class
  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="pb-16">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-800">History</h1>
      </div>
      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="p-3 flex flex-wrap gap-3">
          {/* Time Filter */}
          <div className="flex items-center">
            <FilterIcon size={16} className="text-gray-500 mr-1" />
            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="text-sm border-none bg-transparent text-gray-600 focus:ring-0">
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          {/* Status Filter */}
          <div className="flex items-center ml-4">
            <span className="text-sm text-gray-500 mr-2">Status:</span>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button onClick={() => setStatusFilter('all')} className={`text-xs px-2 py-1 rounded ${statusFilter === 'all' ? 'bg-white shadow' : 'text-gray-600'}`}>
                All
              </button>
              <button onClick={() => setStatusFilter('completed')} className={`text-xs px-2 py-1 rounded ${statusFilter === 'completed' ? 'bg-white shadow' : 'text-gray-600'}`}>
                Completed
              </button>
              <button onClick={() => setStatusFilter('pending')} className={`text-xs px-2 py-1 rounded ${statusFilter === 'pending' ? 'bg-white shadow' : 'text-gray-600'}`}>
                Pending
              </button>
            </div>
          </div>
        </div>
        {/* Date Filter */}
        <div className="p-3 pt-0 flex items-center">
          <CalendarIcon size={16} className="text-gray-500 mr-2" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="text-sm border-gray-200 rounded-md focus:ring-green-500 focus:border-green-500" />
          {selectedDate && <button onClick={() => setSelectedDate('')} className="ml-2 text-xs text-gray-500 hover:text-gray-700">
              Clear
            </button>}
        </div>
      </div>
      {/* Task Count Summary */}
      <div className="bg-green-50 rounded-lg p-3 mb-4 text-sm text-green-800">
        <p>
          Showing {filteredTasks.length} task
          {filteredTasks.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' ? ` (${statusFilter})` : ''}
          {selectedDate ? ` on ${new Date(selectedDate).toLocaleDateString()}` : ''}
        </p>
      </div>
      {groupedTasks.length === 0 ? <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-3">
            <CalendarIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700 mb-1">No History</h3>
          <p className="text-sm text-gray-500">
            No tasks have been logged in the selected time period.
          </p>
        </div> : <div className="space-y-6">
          {groupedTasks.map(([date, tasks]) => <div key={date}>
              <div className="flex items-center mb-2">
                <CalendarIcon size={16} className="text-gray-500 mr-2" />
                <h2 className="text-sm font-medium text-gray-500">{date}</h2>
              </div>
              <div className="space-y-2">
                {tasks.map(task => <div key={task.id} className="bg-white rounded-lg shadow p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">
                            {formatTaskType(task.type)}
                          </p>
                          {task.priority && <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>}
                          {task.completed !== undefined && <span className="ml-2">
                              {task.completed ? <CheckCircleIcon size={16} className="text-green-500" /> : <XCircleIcon size={16} className="text-gray-400" />}
                            </span>}
                        </div>
                        {task.qty && <p className="text-sm text-gray-600">
                            Quantity: {task.qty}
                          </p>}
                        {task.notes && <p className="text-sm mt-1">{task.notes}</p>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(task.ts)}
                      </span>
                    </div>
                  </div>)}
              </div>
            </div>)}
        </div>}
    </div>;
};