import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EyeIcon, EyeOffIcon, Loader2Icon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signUp, loading } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear messages when user starts typing
    if (error || success) {
      setError('')
      setSuccess('')
    }
  }

  const validateForm = (): { isValid: boolean; errorMessage: string } => {
    // Check for empty fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword || !formData.location.trim()) {
      return { isValid: false, errorMessage: 'Please fill in all fields' }
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      return { isValid: false, errorMessage: 'Name must be at least 2 characters long' }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      return { isValid: false, errorMessage: 'Please enter a valid email address' }
    }

    // Password validation
    if (formData.password.length < 6) {
      return { isValid: false, errorMessage: 'Password must be at least 6 characters long' }
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumbers = /\d/.test(formData.password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { isValid: false, errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      return { isValid: false, errorMessage: 'Passwords do not match' }
    }

    // Location validation
    if (formData.location.trim().length < 3) {
      return { isValid: false, errorMessage: 'Location must be at least 3 characters long' }
    }

    return { isValid: true, errorMessage: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validate form
    const validation = validateForm()
    if (!validation.isValid) {
      setError(validation.errorMessage)
      setIsSubmitting(false)
      return
    }

    try {
      const { error: signUpError } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.location.trim()
      )

      if (signUpError) {
        setError(signUpError)
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.')
        // Clear form on success
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          location: '',
        })
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join RangeTrack to manage your farm</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sign Up Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Account Created!</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
              disabled={isSubmitting || loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={isSubmitting || loading}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Farm/Ranch Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Texas Ranch, California Farm"
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
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
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
                disabled={isSubmitting || loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isSubmitting || loading}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium"
              disabled={isSubmitting || loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
