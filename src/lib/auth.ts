import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  location: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
  location: string
}

export interface SignInData {
  email: string
  password: string
}

// Authentication service
export const authService = {
  // Sign up new user
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Step 1: Create the authentication user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (authData.user) {
        // Step 2: Create the user profile manually
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            location: data.location,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, still return the auth user
          // The profile can be created later
          const user: AuthUser = {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            location: data.location,
          }
          return { user, error: null }
        }

        // Step 3: Check if email confirmation is required
        if (!authData.user.email_confirmed_at) {
          return { 
            user: null, 
            error: 'Please check your email and click the confirmation link before signing in.' 
          }
        }

        const user: AuthUser = {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          location: data.location,
        }

        return { user, error: null }
      }

      return { user: null, error: 'Sign up failed' }
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: 'An unexpected error occurred' }
    }
  },

  // Sign in existing user
  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (authData.user) {
        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          return { user: null, error: profileError.message }
        }

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          location: profile.location,
        }

        return { user, error: null }
      }

      return { user: null, error: 'Sign in failed' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  },

  // Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return { user: null, error: authError?.message || 'No user found' }
      }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        return { user: null, error: profileError.message }
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        location: profile.location,
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  },



  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error: error?.message || null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },

  // Update password
  async updatePassword(password: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      return { error: error?.message || null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },
}
