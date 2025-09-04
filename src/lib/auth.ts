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

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred'
  
  const message = error.message || error.toString()
  
  // Debug: Log the actual error message to see what we're getting
  console.log('Auth error received:', message)
  console.log('Full error object:', error)
  
  // Common Supabase auth errors - check multiple variations
  if (message.includes('Invalid login credentials') || 
      message.includes('Invalid login') ||
      message.includes('invalid login') ||
      message.includes('Invalid credentials') ||
      message.includes('invalid credentials') ||
      message.includes('Invalid email or password') ||
      message.includes('invalid email or password') ||
      message.includes('Wrong email or password') ||
      message.includes('wrong email or password') ||
      message.includes('Incorrect email or password') ||
      message.includes('incorrect email or password') ||
      message.includes('Invalid email/password') ||
      message.includes('invalid email/password') ||
      message.includes('Authentication failed') ||
      message.includes('authentication failed') ||
      message.includes('Login failed') ||
      message.includes('login failed')) {
    return '❌ Invalid email or password. Please double-check your credentials. If you don\'t have an account, click "Sign up" below to create one.'
  }
  
  if (message.includes('Email not confirmed') || 
      message.includes('email not confirmed') ||
      message.includes('Email not verified') ||
      message.includes('email not verified') ||
      message.includes('Email confirmation required') ||
      message.includes('email confirmation required')) {
    return 'Please check your email and click the confirmation link before signing in.'
  }
  
  if (message.includes('User already registered') || 
      message.includes('user already registered') ||
      message.includes('User already exists') ||
      message.includes('user already exists') ||
      message.includes('Email already registered') ||
      message.includes('email already registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  
  if (message.includes('Password should be at least') || 
      message.includes('password should be at least') ||
      message.includes('Password must be at least') ||
      message.includes('password must be at least') ||
      message.includes('Password too short') ||
      message.includes('password too short')) {
    return 'Password must be at least 6 characters long.'
  }
  
  if (message.includes('Unable to validate email address') || 
      message.includes('unable to validate email address') ||
      message.includes('Invalid email') ||
      message.includes('invalid email') ||
      message.includes('Invalid email format') ||
      message.includes('invalid email format')) {
    return 'Please enter a valid email address.'
  }
  
  if (message.includes('Too many requests') || 
      message.includes('too many requests') ||
      message.includes('Rate limit') ||
      message.includes('rate limit') ||
      message.includes('Too many attempts') ||
      message.includes('too many attempts')) {
    return 'Too many login attempts. Please wait a few minutes before trying again.'
  }
  
  if (message.includes('User not found') || 
      message.includes('user not found') ||
      message.includes('No user found') ||
      message.includes('no user found') ||
      message.includes('Account not found') ||
      message.includes('account not found') ||
      message.includes('User does not exist') ||
      message.includes('user does not exist')) {
    return '👤 No account found with this email address. Please check your email spelling or click "Sign up" below to create a new account.'
  }
  
  // Check for specific Supabase error codes
  if (message.includes('400') && (message.includes('Invalid') || message.includes('invalid'))) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  
  if (message.includes('401') && (message.includes('Invalid') || message.includes('invalid'))) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  
  // Database errors
  if (message.includes('duplicate key value')) {
    return 'An account with this email already exists.'
  }
  
  if (message.includes('permission denied')) {
    return 'Access denied. Please contact support if this persists.'
  }
  
  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('Network')) {
    return 'Network error. Please check your internet connection and try again.'
  }
  
  // If we can't match any specific error, return a generic but helpful message
  if (message.toLowerCase().includes('invalid') || 
      message.toLowerCase().includes('incorrect') ||
      message.toLowerCase().includes('wrong') ||
      message.toLowerCase().includes('failed')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  
  // Return the original message if we can't translate it
  return message
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
        return { user: null, error: getErrorMessage(authError) }
      }

      if (authData.user) {
        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          return { user: null, error: getErrorMessage(profileError) }
        }

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          location: profile.location,
        }

        return { user, error: null }
      }

      return { user: null, error: 'Sign in failed. Please try again.' }
    } catch (error) {
      return { user: null, error: getErrorMessage(error) }
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
