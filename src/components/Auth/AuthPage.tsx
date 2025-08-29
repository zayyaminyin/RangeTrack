import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')

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
      </div>
    </div>
  )
}
