import { Task, Award } from '../types';
// Award definitions with quirky texts
const AWARD_DEFINITIONS = [{
  id: 'first_task',
  label: 'Farm Starter',
  reason: 'Logged your first ranch task! Every journey begins with a single log.',
  check: (tasks: Task[]) => tasks.length === 1
}, {
  id: 'water_wizard',
  label: 'Water Wizard',
  reason: 'Kept everything hydrated for 7 days straight. Your plants are practically singing!',
  check: (tasks: Task[]) => {
    // Check if there are watering tasks for 7 consecutive days
    const wateringDays = new Set();
    tasks.forEach(task => {
      if (task.type === 'watering') {
        const date = new Date(task.ts).toLocaleDateString();
        wateringDays.add(date);
      }
    });
    return wateringDays.size >= 7;
  }
}, {
  id: 'mr_fix_it',
  label: 'Mr. Fix-It',
  reason: 'First equipment repair logged! MacGyver would be proud.',
  check: (tasks: Task[]) => tasks.some(task => task.type === 'repair')
}, {
  id: 'green_thumb',
  label: 'Green Thumb',
  reason: "First harvest recorded! From seed to success - that's farming magic.",
  check: (tasks: Task[]) => tasks.some(task => task.type === 'harvest')
}, {
  id: 'early_bird',
  label: 'Early Bird',
  reason: 'Logged a task before 6 AM. The roosters are taking notes!',
  check: (tasks: Task[]) => {
    return tasks.some(task => {
      const taskHour = new Date(task.ts).getHours();
      return taskHour < 6;
    });
  }
}, {
  id: 'herd_mover',
  label: 'Herd Mover',
  reason: "Successfully relocated your animals 5 times. They're following you like a celebrity now!",
  check: (tasks: Task[]) => {
    return tasks.filter(task => task.type === 'herd_move').length >= 5;
  }
}];
export const checkAwards = (tasks: Task[], existingAwards: Award[]): Award[] => {
  const newAwards: Award[] = [];
  const existingAwardIds = new Set(existingAwards.map(award => award.id));
  AWARD_DEFINITIONS.forEach(definition => {
    // Skip if already earned
    if (existingAwardIds.has(definition.id)) return;
    // Check if award condition is met
    if (definition.check(tasks)) {
      newAwards.push({
        id: definition.id,
        label: definition.label,
        reason: definition.reason,
        earned_ts: Date.now()
      });
    }
  });
  return newAwards;
};