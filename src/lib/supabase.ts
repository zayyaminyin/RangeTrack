import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          user_id: string
          type: 'animal' | 'field' | 'equipment' | 'feed'
          name: string
          quantity: number | null
          status: string | null
          health: number | null
          last_checked: string | null
          notes: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'animal' | 'field' | 'equipment' | 'feed'
          name: string
          quantity?: number | null
          status?: string | null
          health?: number | null
          last_checked?: string | null
          notes?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'animal' | 'field' | 'equipment' | 'feed'
          name?: string
          quantity?: number | null
          status?: string | null
          health?: number | null
          last_checked?: string | null
          notes?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          type: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          resource_id: string | null
          qty: number | null
          notes: string | null
          ts: number
          completed: boolean | null
          image: string | null
          priority: 'low' | 'medium' | 'high' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          resource_id?: string | null
          qty?: number | null
          notes?: string | null
          ts: number
          completed?: boolean | null
          image?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          resource_id?: string | null
          qty?: number | null
          notes?: string | null
          ts?: number
          completed?: boolean | null
          image?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          user_id: string
          label: string
          reason: string
          earned_ts: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          reason: string
          earned_ts: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          reason?: string
          earned_ts?: number
          created_at?: string
        }
      }
    }
  }
}
