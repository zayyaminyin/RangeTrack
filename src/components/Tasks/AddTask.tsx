import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CameraIcon, CalendarIcon, ClockIcon, AlertTriangleIcon } from 'lucide-react';
import { Task, Resource, TaskType } from '../../types';
interface AddTaskProps {
  onAddTask: (task: Omit<Task, 'id' | 'ts'>) => void;
  resources: Resource[];
}
export const AddTask: React.FC<AddTaskProps> = ({
  onAddTask,
  resources
}) => {
  const navigate = useNavigate();
  const [taskType, setTaskType] = useState<TaskType>('feeding');
  const [resourceId, setResourceId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  // Filter resources by task type
  const getFilteredResources = () => {
    switch (taskType) {
      case 'feeding':
        return resources.filter(r => r.type === 'animal');
      case 'watering':
        return resources.filter(r => r.type === 'field');
      case 'repair':
      case 'maintenance':
        return resources.filter(r => r.type === 'equipment');
      case 'harvest':
        return resources.filter(r => r.type === 'field');
      case 'health_check':
      case 'vaccination':
        return resources.filter(r => r.type === 'animal');
      default:
        return resources;
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate timestamp based on schedule or current time
    let timestamp = Date.now();
    if (scheduleDate) {
      const date = new Date(scheduleDate);
      if (scheduleTime) {
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        date.setHours(hours, minutes);
      }
      timestamp = date.getTime();
    }
    const newTask: Omit<Task, 'id' | 'ts'> = {
      type: taskType,
      resource_id: resourceId || undefined,
      qty: quantity ? parseInt(quantity, 10) : undefined,
      notes: notes || undefined,
      priority,
      completed: false
    };
    onAddTask(newTask);
    navigate('/');
  };
  return <div className="pb-16">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-2xl font-bold text-green-800">Add Task</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <select value={taskType} onChange={e => setTaskType(e.target.value as TaskType)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" required>
            <option value="feeding">Feeding</option>
            <option value="watering">Watering</option>
            <option value="herd_move">Herd Move</option>
            <option value="repair">Repair</option>
            <option value="maintenance">Maintenance</option>
            <option value="harvest">Harvest</option>
            <option value="health_check">Health Check</option>
            <option value="vaccination">Vaccination</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource
          </label>
          <select value={resourceId} onChange={e => setResourceId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
            <option value="">Select a resource</option>
            {getFilteredResources().map(resource => <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>)}
          </select>
        </div>
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <div className="flex space-x-2">
            <button type="button" onClick={() => setPriority('low')} className={`flex-1 py-2 px-3 rounded-md border ${priority === 'low' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
              Low
            </button>
            <button type="button" onClick={() => setPriority('medium')} className={`flex-1 py-2 px-3 rounded-md border ${priority === 'medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-700'}`}>
              Medium
            </button>
            <button type="button" onClick={() => setPriority('high')} className={`flex-1 py-2 px-3 rounded-md border ${priority === 'high' ? 'bg-red-100 border-red-300 text-red-700' : 'border-gray-300 text-gray-700'}`}>
              <div className="flex items-center justify-center">
                {priority === 'high' && <AlertTriangleIcon size={14} className="mr-1" />}
                High
              </div>
            </button>
          </div>
        </div>
        {/* Schedule (optional) */}
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Schedule (Optional)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                <div className="flex items-center">
                  <CalendarIcon size={12} className="mr-1" />
                  Date
                </div>
              </label>
              <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                <div className="flex items-center">
                  <ClockIcon size={12} className="mr-1" />
                  Time
                </div>
              </label>
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm" />
            </div>
          </div>
        </div>
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Enter quantity" className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
        </div>
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" rows={3} />
        </div>
        {/* Photo Upload (placeholder) */}
        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
          <div className="flex flex-col items-center">
            <CameraIcon size={24} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Add photo (optional)</p>
            <button type="button" className="mt-2 text-xs text-green-600">
              Choose file
            </button>
          </div>
        </div>
        {/* Submit Button */}
        <div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md">
            {scheduleDate ? 'Schedule Task' : 'Log Task Now'}
          </button>
        </div>
      </form>
    </div>;
};