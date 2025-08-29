import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { useAuth } from '../../context/AuthContext'
import { XIcon, Loader2Icon } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { resetPassword, loading } = useAuth()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage('Please enter your email address')
      return
    }

    const { error } = await resetPassword(email)
    if (error) {
      setMessage(error)
    } else {
      setMessage('Password reset email sent! Check your inbox.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">RangeTrack</h1>
          <p className="text-gray-600">Farm & Ranch Management Companion</p>
        </div>

        {/* Auth Forms */}
        {mode === 'login' && (
          <LoginForm
            onSwitchToSignUp={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}

        {mode === 'signup' && (
          <SignUpForm onSwitchToLogin={() => setMode('login')} />
        )}

        {/* Forgot Password Modal */}
        {mode === 'forgot-password' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">Reset Password</h2>
              <button
                onClick={() => setMode('login')}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {message && (
                <div className={`px-4 py-3 rounded-md ${
                  message.includes('sent') 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
