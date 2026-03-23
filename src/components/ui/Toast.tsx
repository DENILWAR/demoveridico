import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Helper functions
export function toast(options: Omit<Toast, 'id'>) {
  // This will be set by the ToastProvider
  if (typeof window !== 'undefined' && (window as any).__addToast) {
    (window as any).__addToast(options)
  }
}

toast.success = (title: string, message?: string) =>
  toast({ type: 'success', title, message })
toast.error = (title: string, message?: string) =>
  toast({ type: 'error', title, message })
toast.warning = (title: string, message?: string) =>
  toast({ type: 'warning', title, message })
toast.info = (title: string, message?: string) =>
  toast({ type: 'info', title, message })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Expose addToast globally for the helper function
  useEffect(() => {
    (window as any).__addToast = addToast
    return () => {
      delete (window as any).__addToast
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: 'text-success-500',
    title: 'text-success-800',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    icon: 'text-error-500',
    title: 'text-error-800',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: 'text-warning-500',
    title: 'text-warning-800',
  },
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    icon: 'text-primary-500',
    title: 'text-primary-800',
  },
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = iconMap[toast.type]
  const colors = colorMap[toast.type]

  useEffect(() => {
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'pointer-events-auto rounded-lg border shadow-lg p-4',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-sm', colors.title)}>{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
