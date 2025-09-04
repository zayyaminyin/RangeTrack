import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { useDemo } from '../../context/DemoContext'
import { Play, Eye } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const { enterDemoMode } = useDemo()

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

        {mode === 'forgot-password' && (
          <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
        )}

        {/* Demo Mode Banner */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-primary-200">
            <div className="flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-primary-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Try Demo Mode</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Explore RangeTrack with a fully populated demo farm featuring real data, 
              animals, equipment, and farming activities.
            </p>
            <button
              onClick={enterDemoMode}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Play className="h-5 w-5" />
              <span>Start Demo Tour</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              No account required • Explore all features • Sample farm data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
