import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EyeIcon, EyeOffIcon, Loader2Icon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'

interface LoginFormProps {
  onSwitchToSignUp: () => void
  onForgotPassword: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const { error: signInError } = await signIn(email.trim(), password)
      
      if (signInError) {
        setError(signInError)
      } else {
        setSuccess('Signing you in...')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your RangeTrack account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sign In Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Success</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearMessages()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={isSubmitting || loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearMessages()
                }}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isSubmitting || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isSubmitting || loading}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400"
              disabled={isSubmitting || loading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-green-600 hover:text-green-700 font-medium"
              disabled={isSubmitting || loading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
