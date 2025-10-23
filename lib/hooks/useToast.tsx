'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive' | 'success' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getIcon = (variant: Toast['variant']) => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={toast.variant === 'success' || toast.variant === 'info' ? 'default' : toast.variant}
            className={cn(
              'transition-all duration-300 shadow-lg',
              toast.variant === 'success' && 'border-green-500 bg-green-50 text-green-900',
              toast.variant === 'info' && 'border-blue-500 bg-blue-50 text-blue-900'
            )}
          >
            <div className="flex items-start gap-3">
              {getIcon(toast.variant)}
              <div className="flex-1">
                {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
                <AlertDescription>{toast.description}</AlertDescription>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    toast: context.addToast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  }
}
