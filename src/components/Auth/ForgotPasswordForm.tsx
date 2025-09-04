import React, { useState } from 'react'
import { authService } from '../../lib/auth'
import { ArrowLeftIcon, Loader2Icon, AlertCircleIcon, CheckCircleIcon, MailIcon } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address')
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

    try {
      const { error: resetError } = await authService.resetPassword(email.trim())
      
      if (resetError) {
        setError(resetError)
      } else {
        setSuccess('Password reset email sent! Please check your inbox and follow the instructions.')
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
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MailIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">Reset Password</h2>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Reset Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Sent!</p>
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
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Sending reset email...
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center mx-auto"
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Sign In
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-green-600 hover:text-green-700 underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
