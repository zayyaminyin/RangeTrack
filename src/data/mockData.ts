import { User, Resource, Task, Award, Weather } from '../types';
export const mockUser: User = {
  id: '1',
  name: 'John Rancher',
  location: 'Big Sky Ranch, Montana'
};
export const mockResources: Resource[] = [{
  id: '1',
  type: 'animal',
  name: 'Cattle',
  quantity: 120
}, {
  id: '2',
  type: 'animal',
  name: 'Sheep',
  quantity: 75
}, {
  id: '3',
  type: 'field',
  name: 'North Pasture',
  status: 'active'
}, {
  id: '4',
  type: 'field',
  name: 'South Pasture',
  status: 'inactive'
}, {
  id: '5',
  type: 'equipment',
  name: 'Tractor (John Deere)',
  status: 'active'
}, {
  id: '6',
  type: 'equipment',
  name: 'ATV',
  status: 'needs repair'
}, {
  id: '7',
  type: 'feed',
  name: 'Hay Bales',
  quantity: 85
}, {
  id: '8',
  type: 'feed',
  name: 'Grain Bags',
  quantity: 45
}];
export const mockTasks: Task[] = [{
  id: '1',
  type: 'feeding',
  resource_id: '7',
  qty: 5,
  notes: 'Fed cattle in North Pasture',
  ts: Date.now() - 86400000,
  // Yesterday
  completed: true
}, {
  id: '2',
  type: 'watering',
  resource_id: '3',
  notes: 'Checked water troughs in North Pasture',
  ts: Date.now() - 43200000,
  // 12 hours ago
  completed: true
}, {
  id: '3',
  type: 'repair',
  resource_id: '6',
  notes: 'ATV needs new spark plugs',
  ts: Date.now() - 172800000,
  // 2 days ago
  completed: false
}, {
  id: '4',
  type: 'feeding',
  resource_id: '7',
  qty: 5,
  notes: 'Morning feed for cattle',
  ts: Date.now(),
  // Today
  completed: false
}, {
  id: '5',
  type: 'herd_move',
  resource_id: '1',
  notes: 'Move cattle to South Pasture',
  ts: Date.now() + 86400000,
  // Tomorrow
  completed: false
}];
export const mockAwards: Award[] = [{
  id: '1',
  label: 'Farm Starter',
  reason: 'Logged your first task',
  earned_ts: Date.now() - 604800000,
  // 7 days ago
  icon: '🌱'
}, {
  id: '2',
  label: 'Water Wizard',
  reason: 'Logged watering tasks for 7 consecutive days',
  earned_ts: Date.now() - 86400000,
  // Yesterday
  icon: '💧'
}];
export const mockWeather: Weather = {
  temp: 72,
  condition: 'Partly Cloudy',
  icon: '⛅'
};
export const getTasksForToday = (): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return mockTasks.filter(task => {
    const taskDate = new Date(task.ts);
    return taskDate >= today && taskDate < tomorrow;
  });
};
export const getUpcomingTasks = (): Task[] => {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return mockTasks.filter(task => {
    const taskDate = new Date(task.ts);
    return taskDate >= tomorrow && !task.completed;
  });
};
export const getResourceById = (id: string): Resource | undefined => {
  return mockResources.find(resource => resource.id === id);
};
export const calculateFeedDaysRemaining = (): number => {
  // Simple calculation for MVP
  const feedResources = mockResources.filter(r => r.type === 'feed');
  const totalFeed = feedResources.reduce((sum, r) => sum + (r.quantity || 0), 0);
  // Assume average daily use of 7 units
  return Math.floor(totalFeed / 7);
};