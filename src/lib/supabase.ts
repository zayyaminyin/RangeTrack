import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Updated to match comprehensive schema
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          location: string | null
          phone: string | null
          timezone: string
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          location?: string | null
          phone?: string | null
          timezone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          location?: string | null
          phone?: string | null
          timezone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          coordinates: any | null
          owner_id: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          coordinates?: any | null
          owner_id: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          coordinates?: any | null
          owner_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      collaborators: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          role: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          role?: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          role?: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by?: string | null
          joined_at?: string | null
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          farm_id: string
          email: string
          role: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by: string
          message: string | null
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          email: string
          role?: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          email?: string
          role?: 'owner' | 'manager' | 'worker' | 'viewer'
          invited_by?: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          type: 'animal' | 'field' | 'equipment' | 'feed' | 'building' | 'water_source' | 'fence'
          name: string
          description: string | null
          quantity: number | null
          unit: string | null
          status: 'active' | 'maintenance' | 'inactive'
          health_score: number | null
          last_checked: string | null
          location: string | null
          coordinates: any | null
          notes: string | null
          metadata: any
          images: string[] | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          type: 'animal' | 'field' | 'equipment' | 'feed' | 'building' | 'water_source' | 'fence'
          name: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          status?: 'active' | 'maintenance' | 'inactive'
          health_score?: number | null
          last_checked?: string | null
          location?: string | null
          coordinates?: any | null
          notes?: string | null
          metadata?: any
          images?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          type?: 'animal' | 'field' | 'equipment' | 'feed' | 'building' | 'water_source' | 'fence'
          name?: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          status?: 'active' | 'maintenance' | 'inactive'
          health_score?: number | null
          last_checked?: string | null
          location?: string | null
          coordinates?: any | null
          notes?: string | null
          metadata?: any
          images?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      resource_history: {
        Row: {
          id: string
          resource_id: string
          user_id: string | null
          action: string
          old_values: any | null
          new_values: any | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id?: string | null
          action: string
          old_values?: any | null
          new_values?: any | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          user_id?: string | null
          action?: string
          old_values?: any | null
          new_values?: any | null
          notes?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          assigned_to: string | null
          resource_id: string | null
          type: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          title: string
          description: string | null
          quantity: number | null
          unit: string | null
          priority: 'low' | 'medium' | 'high'
          status: string
          scheduled_at: string | null
          due_date: string | null
          completed_at: string | null
          estimated_duration: string | null
          actual_duration: string | null
          location: string | null
          coordinates: any | null
          notes: string | null
          metadata: any
          images: string[] | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          assigned_to?: string | null
          resource_id?: string | null
          type: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          title: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: string
          scheduled_at?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: string | null
          location?: string | null
          coordinates?: any | null
          notes?: string | null
          metadata?: any
          images?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          assigned_to?: string | null
          resource_id?: string | null
          type?: 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other'
          title?: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: string
          scheduled_at?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: string | null
          location?: string | null
          coordinates?: any | null
          notes?: string | null
          metadata?: any
          images?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          comment: string
          images: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          comment: string
          images?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          comment?: string
          images?: string[] | null
          created_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          type: string
          title: string
          description: string
          icon: string | null
          points: number
          metadata: any
          earned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          type: string
          title: string
          description: string
          icon?: string | null
          points?: number
          metadata?: any
          earned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string
          icon?: string | null
          points?: number
          metadata?: any
          earned_at?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          farm_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: any
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: any
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: any
          created_at?: string
        }
      }
      weather_data: {
        Row: {
          id: string
          farm_id: string
          location: string
          coordinates: any
          current_weather: any | null
          forecast: any | null
          alerts: any | null
          fetched_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          location: string
          coordinates: any
          current_weather?: any | null
          forecast?: any | null
          alerts?: any | null
          fetched_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          farm_id?: string
          location?: string
          coordinates?: any
          current_weather?: any | null
          forecast?: any | null
          alerts?: any | null
          fetched_at?: string
          expires_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      file_references: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          entity_type: string | null
          entity_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          entity_type?: string | null
          entity_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          entity_type?: string | null
          entity_id?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_invitation_id: string }
        Returns: any
      }
      get_farm_analytics: {
        Args: { p_farm_id: string; p_days?: number }
        Returns: any
      }
      log_activity: {
        Args: { 
          p_farm_id: string
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_details?: any
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_farm_id: string
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: any
        }
        Returns: string
      }
    }
  }
}
