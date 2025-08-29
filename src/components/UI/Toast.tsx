import React, { useEffect } from 'react'
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
    iconComponent: CheckCircleIcon,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
    iconComponent: AlertCircleIcon,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    iconComponent: InfoIcon,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    iconComponent: AlertCircleIcon,
  },
}

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const styles = toastStyles[type]
  const IconComponent = styles.iconComponent

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  return (
    <div className={`${styles.bg} ${styles.border} ${styles.text} px-4 py-3 rounded-md shadow-lg border flex items-start space-x-3 max-w-sm`}>
      <IconComponent className={`h-5 w-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
