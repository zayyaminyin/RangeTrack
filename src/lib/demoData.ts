import { Task, Resource } from '../types'
import { Database } from './supabase'

export type DemoTask = Database['public']['Tables']['tasks']['Row']
export type DemoResource = Database['public']['Tables']['resources']['Row']
export type DemoAward = Database['public']['Tables']['awards']['Row']

// Demo user profile
export const demoUser = {
  id: 'demo-user-123',
  email: 'demo@rangetrack.com',
  name: 'Sarah Johnson',
  location: 'Green Valley Ranch, Texas'
}

// Demo resources - comprehensive farm setup
export const demoResources: DemoResource[] = [
  // Animals
  {
    id: 'demo-animal-1',
    user_id: 'demo-user-123',
    name: 'Holstein Dairy Cows',
    type: 'animal',
    quantity: 45,
    health: 92,
    notes: 'Productive dairy herd, excellent milk production',
    image: null,
    last_checked: '2025-01-02T08:30:00Z',
    created_at: '2024-08-15T10:00:00Z',
    updated_at: '2025-01-02T08:30:00Z'
  },
  {
    id: 'demo-animal-2',
    user_id: 'demo-user-123',
    name: 'Angus Beef Cattle',
    type: 'animal',
    quantity: 28,
    health: 88,
    notes: 'Premium beef cattle, ready for market in spring',
    image: null,
    last_checked: '2025-01-02T09:15:00Z',
    created_at: '2024-09-10T14:20:00Z',
    updated_at: '2025-01-02T09:15:00Z'
  },
  {
    id: 'demo-animal-3',
    user_id: 'demo-user-123',
    name: 'Free Range Chickens',
    type: 'animal',
    quantity: 150,
    health: 95,
    notes: 'Excellent egg layers, organic certified',
    image: null,
    last_checked: '2025-01-03T07:45:00Z',
    created_at: '2024-07-20T11:30:00Z',
    updated_at: '2025-01-03T07:45:00Z'
  },
  {
    id: 'demo-animal-4',
    user_id: 'demo-user-123',
    name: 'Border Collie Working Dogs',
    type: 'animal',
    quantity: 3,
    health: 98,
    notes: 'Excellent herding dogs, well-trained',
    image: null,
    last_checked: '2025-01-03T18:00:00Z',
    created_at: '2024-06-05T16:45:00Z',
    updated_at: '2025-01-03T18:00:00Z'
  },

  // Equipment
  {
    id: 'demo-equipment-1',
    user_id: 'demo-user-123',
    name: 'John Deere 6120R Tractor',
    type: 'equipment',
    quantity: 1,
    health: 85,
    notes: '120 HP, 1,250 hours. Needs hydraulic fluid change',
    image: null,
    last_checked: '2025-01-01T10:00:00Z',
    created_at: '2023-03-15T12:00:00Z',
    updated_at: '2025-01-01T10:00:00Z'
  },
  {
    id: 'demo-equipment-2',
    user_id: 'demo-user-123',
    name: 'Case IH Disc Harrow',
    type: 'equipment',
    quantity: 1,
    health: 78,
    notes: '12-foot width, some disc blades need replacement',
    image: null,
    last_checked: '2024-12-28T14:30:00Z',
    created_at: '2022-11-20T09:15:00Z',
    updated_at: '2024-12-28T14:30:00Z'
  },
  {
    id: 'demo-equipment-3',
    user_id: 'demo-user-123',
    name: 'New Holland Hay Baler',
    type: 'equipment',
    quantity: 1,
    health: 90,
    notes: 'Round baler, excellent condition, serviced regularly',
    image: null,
    last_checked: '2024-12-20T11:45:00Z',
    created_at: '2023-05-10T13:20:00Z',
    updated_at: '2024-12-20T11:45:00Z'
  },
  {
    id: 'demo-equipment-4',
    user_id: 'demo-user-123',
    name: 'Ford F-350 Farm Truck',
    type: 'equipment',
    quantity: 1,
    health: 82,
    notes: 'Reliable work truck, 145K miles, needs new tires soon',
    image: null,
    last_checked: '2025-01-02T16:00:00Z',
    created_at: '2021-08-30T10:30:00Z',
    updated_at: '2025-01-02T16:00:00Z'
  },
  {
    id: 'demo-equipment-5',
    user_id: 'demo-user-123',
    name: 'Milking Parlor System',
    type: 'equipment',
    quantity: 1,
    health: 93,
    notes: '8-stall parallel parlor, recently upgraded',
    image: null,
    last_checked: '2025-01-03T05:30:00Z',
    created_at: '2024-02-14T08:00:00Z',
    updated_at: '2025-01-03T05:30:00Z'
  },

  // Fields
  {
    id: 'demo-field-1',
    user_id: 'demo-user-123',
    name: 'North Pasture',
    type: 'field',
    quantity: 85, // acres
    health: 88,
    notes: 'Mixed grass pasture, excellent for grazing. Recently overseeded',
    image: null,
    last_checked: '2025-01-01T12:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T12:00:00Z'
  },
  {
    id: 'demo-field-2',
    user_id: 'demo-user-123',
    name: 'South Corn Field',
    type: 'field',
    quantity: 120, // acres
    health: 92,
    notes: 'Premium soil, harvested 180 bu/acre last season',
    image: null,
    last_checked: '2024-12-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-15T10:30:00Z'
  },
  {
    id: 'demo-field-3',
    user_id: 'demo-user-123',
    name: 'East Hay Field',
    type: 'field',
    quantity: 65, // acres
    health: 85,
    notes: 'Timothy and alfalfa mix, 3 cuts per season',
    image: null,
    last_checked: '2024-12-10T14:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-10T14:00:00Z'
  },
  {
    id: 'demo-field-4',
    user_id: 'demo-user-123',
    name: 'West Soybean Field',
    type: 'field',
    quantity: 95, // acres
    health: 90,
    notes: 'Excellent drainage, rotating with corn next year',
    image: null,
    last_checked: '2024-11-20T09:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-20T09:00:00Z'
  },

  // Feed & Supplies
  {
    id: 'demo-feed-1',
    user_id: 'demo-user-123',
    name: 'Dairy Cow Feed Mix',
    type: 'feed',
    quantity: 2400, // lbs
    health: 95,
    notes: '16% protein blend, high-quality dairy ration',
    image: null,
    last_checked: '2025-01-03T08:00:00Z',
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2025-01-03T08:00:00Z'
  },
  {
    id: 'demo-feed-2',
    user_id: 'demo-user-123',
    name: 'Beef Cattle Grain',
    type: 'feed',
    quantity: 1800, // lbs
    health: 92,
    notes: 'Finishing grain for market-ready cattle',
    image: null,
    last_checked: '2025-01-02T17:30:00Z',
    created_at: '2024-12-25T09:15:00Z',
    updated_at: '2025-01-02T17:30:00Z'
  },
  {
    id: 'demo-feed-3',
    user_id: 'demo-user-123',
    name: 'Chicken Layer Feed',
    type: 'feed',
    quantity: 500, // lbs
    health: 98,
    notes: 'Organic layer pellets, 18% protein',
    image: null,
    last_checked: '2025-01-03T07:00:00Z',
    created_at: '2024-12-30T11:20:00Z',
    updated_at: '2025-01-03T07:00:00Z'
  },
  {
    id: 'demo-feed-4',
    user_id: 'demo-user-123',
    name: 'Premium Hay Bales',
    type: 'feed',
    quantity: 45, // bales
    health: 88,
    notes: 'Round bales, stored in barn, good quality',
    image: null,
    last_checked: '2025-01-01T15:00:00Z',
    created_at: '2024-08-15T12:00:00Z',
    updated_at: '2025-01-01T15:00:00Z'
  }
]

// Demo tasks - realistic farm activities over past weeks
export const demoTasks: DemoTask[] = [
  // Recent tasks (today and yesterday)
  {
    id: 'demo-task-1',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-1',
    qty: 150,
    notes: 'Morning dairy cow feeding - Holstein herd',
    ts: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-2',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-3',
    qty: 25,
    notes: 'Chicken feeding - organic layer pellets',
    ts: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (4 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (4 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-3',
    user_id: 'demo-user-123',
    type: 'watering',
    resource_id: 'demo-animal-2',
    qty: null,
    notes: 'Checked water troughs for beef cattle',
    ts: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (6 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (6 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-4',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-1',
    qty: 150,
    notes: 'Evening dairy cow feeding scheduled',
    ts: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
    completed: false,
    image: null,
    priority: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Yesterday's tasks
  {
    id: 'demo-task-5',
    user_id: 'demo-user-123',
    type: 'repair',
    resource_id: 'demo-equipment-2',
    qty: null,
    notes: 'Replaced worn disc blades on harrow',
    ts: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    completed: true,
    image: null,
    priority: 'medium',
    created_at: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-6',
    user_id: 'demo-user-123',
    type: 'herd_move',
    resource_id: 'demo-animal-2',
    qty: null,
    notes: 'Moved beef cattle to North Pasture for rotational grazing',
    ts: Date.now() - (1 * 24 * 60 * 60 * 1000) - (3 * 60 * 60 * 1000), // 1 day, 3 hours ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000) - (3 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000) - (3 * 60 * 60 * 1000)).toISOString()
  },

  // Past week tasks
  {
    id: 'demo-task-7',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-1',
    qty: 150,
    notes: 'Daily dairy feeding routine',
    ts: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-8',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-3',
    qty: 25,
    notes: 'Morning chicken feeding',
    ts: Date.now() - (2 * 24 * 60 * 60 * 1000) - (2 * 60 * 60 * 1000), // 2 days, 2 hours ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (2 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (2 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-9',
    user_id: 'demo-user-123',
    type: 'harvest',
    resource_id: 'demo-field-3',
    qty: 120, // bales
    notes: 'Third cutting of hay season - excellent yield',
    ts: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-10',
    user_id: 'demo-user-123',
    type: 'repair',
    resource_id: 'demo-equipment-1',
    qty: null,
    notes: 'Routine maintenance - oil change and greasing',
    ts: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
    completed: true,
    image: null,
    priority: 'medium',
    created_at: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString()
  },

  // More historical tasks for rich data
  {
    id: 'demo-task-11',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-2',
    qty: 80,
    notes: 'Beef cattle supplemental feeding',
    ts: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-task-12',
    user_id: 'demo-user-123',
    type: 'watering',
    resource_id: 'demo-animal-3',
    qty: null,
    notes: 'Cleaned and refilled chicken waterers',
    ts: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 days ago
    completed: true,
    image: null,
    priority: null,
    created_at: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString()
  },

  // Upcoming tasks
  {
    id: 'demo-task-13',
    user_id: 'demo-user-123',
    type: 'feeding',
    resource_id: 'demo-animal-2',
    qty: 80,
    notes: 'Beef cattle evening feeding',
    ts: Date.now() + (4 * 60 * 60 * 1000), // 4 hours from now
    completed: false,
    image: null,
    priority: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-14',
    user_id: 'demo-user-123',
    type: 'repair',
    resource_id: 'demo-equipment-4',
    qty: null,
    notes: 'Schedule tire replacement for farm truck',
    ts: Date.now() + (1 * 24 * 60 * 60 * 1000), // Tomorrow
    completed: false,
    image: null,
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-15',
    user_id: 'demo-user-123',
    type: 'herd_move',
    resource_id: 'demo-animal-1',
    qty: null,
    notes: 'Rotate dairy cows to fresh pasture section',
    ts: Date.now() + (2 * 24 * 60 * 60 * 1000), // 2 days from now
    completed: false,
    image: null,
    priority: 'low',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Demo awards for achievements  
export const demoAwards: DemoAward[] = [
  {
    id: 'demo-award-1',
    user_id: 'demo-user-123',
    type: 'task_completion',
    title: 'Task Master',
    description: 'Completed 50 tasks',
    icon: '🏆',
    earned_at: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(), // 1 week ago
    created_at: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-award-2',
    user_id: 'demo-user-123',
    type: 'streak',
    title: 'Consistency Champion',
    description: 'Logged tasks for 14 consecutive days',
    icon: '🔥',
    earned_at: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
    created_at: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: 'demo-award-3',
    user_id: 'demo-user-123',
    type: 'animal_care',
    title: 'Animal Whisperer',
    description: 'Maintained 90%+ animal health for 30 days',
    icon: '🐄',
    earned_at: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString(), // 10 days ago
    created_at: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString()
  }
]

// Convert demo awards to frontend Award format
export const getDemoAwardsForFrontend = () => {
  return demoAwards.map(award => ({
    id: award.id,
    label: award.title,
    reason: award.description,
    earned_ts: new Date(award.earned_at).getTime()
  }));
}