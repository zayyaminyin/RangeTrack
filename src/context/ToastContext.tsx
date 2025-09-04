import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, ToastProps, ToastType } from '../components/UI/Toast'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void
  showSuccess: (title: string, message: string, duration?: number) => void
  showError: (title: string, message: string, duration?: number) => void
  showInfo: (title: string, message: string, duration?: number) => void
  showWarning: (title: string, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      type,
      title,
      message,
      duration,
      onClose: removeToast,
    }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message: string, duration?: number) => {
    addToast(type, title, message, duration)
  }, [addToast])

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    addToast('success', title, message, duration)
  }, [addToast])

  const showError = useCallback((title: string, message: string, duration?: number) => {
    addToast('error', title, message, duration)
  }, [addToast])

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    addToast('info', title, message, duration)
  }, [addToast])

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    addToast('warning', title, message, duration)
  }, [addToast])

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}
