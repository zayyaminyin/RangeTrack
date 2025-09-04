import React, { useState } from 'react';
import { CalendarIcon, PlusIcon, ClockIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { Task } from '../../types';

interface ScheduleProps {
  tasks: Task[];
  onAddTask?: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({ tasks, onAddTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'other' as Task['type'],
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Get tasks for the selected date
  const getTasksForDate = (date: Date) => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.ts);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedDate);
  const todayTasks = getTasksForDate(selectedDate);

  const handleAddTask = () => {
    if (!onAddTask) return;
    
    const taskData = {
      ...newTask,
      ts: selectedDate.getTime()
    };
    
    onAddTask(taskData);
    setShowAddForm(false);
    setNewTask({
      type: 'other',
      notes: '',
      priority: 'medium'
    });
  };

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Schedule</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2"
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'week' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'month' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Month
        </button>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              ← Previous Week
            </button>
            <span className="text-sm font-medium text-gray-700">
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              Next Week →
            </button>
          </div>

          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const dayTasks = getTasksForDate(date);
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-20 p-2 border rounded-lg cursor-pointer transition-colors ${
                    isToday 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                      <div className="text-xs text-gray-500 mt-1">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CalendarIcon size={18} className="mr-2 text-green-600" />
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        task.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}></span>
                      <h3 className="font-medium text-gray-800 capitalize">{task.type.replace('_', ' ')}</h3>
                      {task.completed && (
                        <CheckCircleIcon size={16} className="ml-2 text-green-500" />
                      )}
                    </div>
                    {task.notes && (
                      <p className="text-sm text-gray-600 mb-2">{task.notes}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon size={12} className="mr-1" />
                      {new Date(task.ts).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule New Task</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({...newTask, type: e.target.value as Task['type']})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="feeding">Feeding</option>
                  <option value="watering">Watering</option>
                  <option value="herd_move">Herd Move</option>
                  <option value="repair">Repair</option>
                  <option value="harvest">Harvest</option>
                  <option value="health_check">Health Check</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  placeholder="Add any additional details..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
