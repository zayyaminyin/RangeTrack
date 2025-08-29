import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, AuthUser } from '../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, location: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    const checkUser = async () => {
      try {
        const { user: currentUser, error } = await authService.getCurrentUser()
        if (error) {
          // Silent error handling for no existing session
        } else if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error checking user session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 second timeout

    checkUser()

    return () => clearTimeout(timeoutId)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: signedInUser, error } = await authService.signIn({ email, password })
      if (error) {
        return { error }
      }
      setUser(signedInUser)
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, location: string) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await authService.signUp({ email, password, name, location })
      if (error) {
        return { error }
      }
      setUser(newUser)
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      setUser(null)
      return { error }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email)
      return { error }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
