import { Task, Resource } from '../types';
// Calculate days of feed remaining based on current inventory and usage rate
export const calculateFeedDaysRemaining = (tasks: Task[], resources: Resource[]): number => {
  // Get all feed resources
  const feedResources = resources.filter(r => r.type === 'feed');
  const totalFeedQuantity = feedResources.reduce((sum, resource) => sum + (resource.quantity || 0), 0);
  // Calculate average daily feed usage over the last 7 days
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentFeedingTasks = tasks.filter(task => task.type === 'feeding' && task.ts >= oneWeekAgo);
  // Group by day
  const feedByDay: Record<string, number> = {};
  recentFeedingTasks.forEach(task => {
    const day = new Date(task.ts).toLocaleDateString();
    feedByDay[day] = (feedByDay[day] || 0) + (task.qty || 0);
  });
  // Calculate average
  const days = Object.keys(feedByDay).length || 1; // Avoid division by zero
  const totalUsed = Object.values(feedByDay).reduce((sum, qty) => sum + qty, 0);
  const avgDailyUsage = totalUsed / days;
  // Return days remaining, with a minimum of 0
  return avgDailyUsage > 0 ? Math.max(0, Math.floor(totalFeedQuantity / avgDailyUsage)) : 0;
};
// Calculate equipment uptime percentage
export const calculateEquipmentUptime = (tasks: Task[], equipmentId: string): number => {
  const repairTasks = tasks.filter(task => task.type === 'repair' && task.resource_id === equipmentId);
  if (repairTasks.length === 0) return 100; // No repairs = 100% uptime
  // Sort repair tasks by timestamp
  const sortedRepairs = [...repairTasks].sort((a, b) => a.ts - b.ts);
  // Calculate downtime days
  let totalDowntimeDays = 0;
  let lastRepairTs = 0;
  sortedRepairs.forEach(task => {
    if (lastRepairTs > 0) {
      const downtimeDays = (task.ts - lastRepairTs) / (24 * 60 * 60 * 1000);
      totalDowntimeDays += downtimeDays;
    }
    lastRepairTs = task.ts;
  });
  // Calculate days since first repair
  const firstRepairTs = sortedRepairs[0].ts;
  const totalDays = (Date.now() - firstRepairTs) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.min(100, 100 - totalDowntimeDays / totalDays * 100));
};
// Get today's tasks
export const getTodaysTasks = (tasks: Task[]): Task[] => {
  const today = new Date().setHours(0, 0, 0, 0);
  return tasks.filter(task => {
    const taskDate = new Date(task.ts).setHours(0, 0, 0, 0);
    return taskDate === today;
  });
};
// Get upcoming tasks for the next N days
export const getUpcomingTasks = (tasks: Task[], days: number = 7): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);
  return tasks.filter(task => {
    const taskDate = new Date(task.ts);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > today && taskDate <= endDate && !task.completed;
  }).sort((a, b) => a.ts - b.ts);
};
// Get tasks for a specific date range
export const getTasksInRange = (tasks: Task[], startDate: Date, endDate: Date): Task[] => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return tasks.filter(task => task.ts >= start && task.ts <= end);
};
// Calculate task completion rate for a given period
export const calculateCompletionRate = (tasks: Task[], days: number = 7): number => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const recentTasks = tasks.filter(task => task.ts >= cutoff);
  if (recentTasks.length === 0) return 0;
  const completedTasks = recentTasks.filter(task => task.completed);
  return completedTasks.length / recentTasks.length * 100;
};
// Calculate resource utilization (for equipment)
export const calculateResourceUtilization = (tasks: Task[], resourceId: string, days: number = 30): number => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  // Count days when resource was used
  const usageDays = new Set();
  tasks.forEach(task => {
    if (task.resource_id === resourceId && task.ts >= cutoff) {
      const day = new Date(task.ts).toLocaleDateString();
      usageDays.add(day);
    }
  });
  return Math.round(usageDays.size / days * 100);
};
// Calculate animal health trend
export const calculateHealthTrend = (tasks: Task[], animalId: string, days: number = 90): 'improving' | 'stable' | 'declining' | 'unknown' => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const healthTasks = tasks.filter(task => task.type === 'health_check' && task.resource_id === animalId && task.ts >= cutoff).sort((a, b) => a.ts - b.ts);
  if (healthTasks.length < 2) return 'unknown';
  // Extract health scores from notes (simulated)
  const firstScore = extractHealthScore(healthTasks[0]);
  const lastScore = extractHealthScore(healthTasks[healthTasks.length - 1]);
  if (lastScore - firstScore > 5) return 'improving';
  if (firstScore - lastScore > 5) return 'declining';
  return 'stable';
};
// Helper function to extract health score from task notes
const extractHealthScore = (task: Task): number => {
  // In a real app, this would parse actual health data
  // For demo purposes, we'll return a random number
  return Math.floor(Math.random() * 30) + 70; // Random score between 70-100
};