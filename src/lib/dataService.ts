import { supabase } from './supabase'
import { Database } from './supabase'

type Resource = Database['public']['Tables']['resources']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Award = Database['public']['Tables']['awards']['Row']

type ResourceInsert = Database['public']['Tables']['resources']['Insert']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type AwardInsert = Database['public']['Tables']['awards']['Insert']

type ResourceUpdate = Database['public']['Tables']['resources']['Update']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
type AwardUpdate = Database['public']['Tables']['awards']['Update']

// Data service for managing farm data
export const dataService = {
  // Resource management
  resources: {
    // Get all resources for a user
    async getAll(userId: string): Promise<{ data: Resource[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch resources' }
      }
    },

    // Get a single resource by ID
    async getById(id: string, userId: string): Promise<{ data: Resource | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch resource' }
      }
    },

    // Create a new resource
    async create(resource: ResourceInsert): Promise<{ data: Resource | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('resources')
          .insert(resource)
          .select()
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to create resource' }
      }
    },

    // Update an existing resource
    async update(id: string, updates: ResourceUpdate): Promise<{ data: Resource | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('resources')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to update resource' }
      }
    },

    // Delete a resource
    async delete(id: string): Promise<{ error: string | null }> {
      try {
        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', id)

        return { error: error?.message || null }
      } catch (error) {
        return { error: 'Failed to delete resource' }
      }
    },

    // Get resources by type
    async getByType(userId: string, type: Resource['type']): Promise<{ data: Resource[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('user_id', userId)
          .eq('type', type)
          .order('created_at', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch resources by type' }
      }
    },
  },

  // Task management
  tasks: {
    // Get all tasks for a user
    async getAll(userId: string): Promise<{ data: Task[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('ts', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch tasks' }
      }
    },

    // Get tasks by date range
    async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<{ data: Task[] | null; error: string | null }> {
      try {
        const startTs = startDate.getTime()
        const endTs = endDate.getTime()

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .gte('ts', startTs)
          .lte('ts', endTs)
          .order('ts', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch tasks by date range' }
      }
    },

    // Get today's tasks
    async getTodaysTasks(userId: string): Promise<{ data: Task[] | null; error: string | null }> {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      return this.getByDateRange(userId, startOfDay, endOfDay)
    },

    // Get a single task by ID
    async getById(id: string, userId: string): Promise<{ data: Task | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch task' }
      }
    },

    // Create a new task
    async create(task: TaskInsert): Promise<{ data: Task | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert(task)
          .select()
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to create task' }
      }
    },

    // Update an existing task
    async update(id: string, updates: TaskUpdate): Promise<{ data: Task | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to update task' }
      }
    },

    // Delete a task
    async delete(id: string): Promise<{ error: string | null }> {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)

        return { error: error?.message || null }
      } catch (error) {
        return { error: 'Failed to delete task' }
      }
    },

    // Mark task as completed
    async markCompleted(id: string): Promise<{ data: Task | null; error: string | null }> {
      return this.update(id, { completed: true })
    },

    // Get tasks by type
    async getByType(userId: string, type: Task['type']): Promise<{ data: Task[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('type', type)
          .order('ts', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch tasks by type' }
      }
    },

    // Get completed tasks
    async getCompleted(userId: string): Promise<{ data: Task[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true)
          .order('ts', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch completed tasks' }
      }
    },
  },

  // Award management
  awards: {
    // Get all awards for a user
    async getAll(userId: string): Promise<{ data: Award[] | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('awards')
          .select('*')
          .eq('user_id', userId)
          .order('earned_ts', { ascending: false })

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to fetch awards' }
      }
    },

    // Create a new award
    async create(award: AwardInsert): Promise<{ data: Award | null; error: string | null }> {
      try {
        const { data, error } = await supabase
          .from('awards')
          .insert(award)
          .select()
          .single()

        return { data, error: error?.message || null }
      } catch (error) {
        return { data: null, error: 'Failed to create award' }
      }
    },

    // Delete an award
    async delete(id: string): Promise<{ error: string | null }> {
      try {
        const { error } = await supabase
          .from('awards')
          .delete()
          .eq('id', id)

        return { error: error?.message || null }
      } catch (error) {
        return { error: 'Failed to delete award' }
      }
    },
  },

  // Analytics and insights
  analytics: {
    // Get task completion statistics
    async getTaskStats(userId: string, days: number = 30): Promise<{ data: any; error: string | null }> {
      try {
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .gte('ts', startDate.getTime())
          .lte('ts', endDate.getTime())

        if (error) {
          return { data: null, error: error.message }
        }

        const totalTasks = tasks?.length || 0
        const completedTasks = tasks?.filter(task => task.completed)?.length || 0
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        const tasksByType = tasks?.reduce((acc, task) => {
          acc[task.type] = (acc[task.type] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        return {
          data: {
            totalTasks,
            completedTasks,
            completionRate,
            tasksByType,
            period: `${days} days`,
          },
          error: null,
        }
      } catch (error) {
        return { data: null, error: 'Failed to fetch task statistics' }
      }
    },

    // Get resource summary
    async getResourceSummary(userId: string): Promise<{ data: any; error: string | null }> {
      try {
        const { data: resources, error } = await supabase
          .from('resources')
          .select('*')
          .eq('user_id', userId)

        if (error) {
          return { data: null, error: error.message }
        }

        const resourcesByType = resources?.reduce((acc, resource) => {
          if (!acc[resource.type]) {
            acc[resource.type] = { count: 0, totalQuantity: 0 }
          }
          acc[resource.type].count += 1
          acc[resource.type].totalQuantity += resource.quantity || 0
          return acc
        }, {} as Record<string, { count: number; totalQuantity: number }>) || {}

        const totalResources = resources?.length || 0
        const activeResources = resources?.filter(resource => resource.status === 'active')?.length || 0

        return {
          data: {
            totalResources,
            activeResources,
            resourcesByType,
          },
          error: null,
        }
      } catch (error) {
        return { data: null, error: 'Failed to fetch resource summary' }
      }
    },
  },
}
