'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, WifiOff, RefreshCw } from 'lucide-react'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

// Friendly error messages in Bulgarian
export const FRIENDLY_MESSAGES = {
    network: {
        title: 'Опа! Няма връзка',
        message: 'Провери интернет връзката си и опитай пак.'
    },
    server: {
        title: 'Нещо се обърка при нас',
        message: 'Екипът ни е уведомен. Опитай пак след малко.'
    },
    unauthorized: {
        title: 'Сесията ти изтече',
        message: 'Моля, влез отново в профила си.'
    },
    forbidden: {
        title: 'Нямаш достъп тук',
        message: 'Това съдържание е за Premium членове.'
    },
    notFound: {
        title: 'Не намерихме това',
        message: 'Страницата или ресурсът не съществува.'
    },
    validation: {
        title: 'Провери данните',
        message: 'Някои полета не са попълнени правилно.'
    },
    timeout: {
        title: 'Отне твърде дълго',
        message: 'Сървърът не отговаря. Опитай пак.'
    },
    generic: {
        title: 'Нещо се обърка',
        message: 'Опитай отново или се свържи с нас.'
    }
} as const

// Context type
interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => string
    removeToast: (id: string) => void
    // Convenience methods
    success: (title: string, message?: string) => void
    error: (title: string, message?: string, action?: Toast['action']) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
    // Predefined error handlers
    networkError: (onRetry?: () => void) => void
    serverError: (onRetry?: () => void) => void
    authError: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000
        }

        setToasts(prev => [...prev, newToast])

        // Auto-remove after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Convenience methods
    const success = useCallback((title: string, message?: string) => {
        addToast({ type: 'success', title, message })
    }, [addToast])

    const error = useCallback((title: string, message?: string, action?: Toast['action']) => {
        addToast({ type: 'error', title, message, action, duration: action ? 8000 : 5000 })
    }, [addToast])

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: 'warning', title, message })
    }, [addToast])

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: 'info', title, message })
    }, [addToast])

    // Predefined error handlers
    const networkError = useCallback((onRetry?: () => void) => {
        addToast({
            type: 'error',
            title: FRIENDLY_MESSAGES.network.title,
            message: FRIENDLY_MESSAGES.network.message,
            duration: 8000,
            action: onRetry ? { label: 'Опитай пак', onClick: onRetry } : undefined
        })
    }, [addToast])

    const serverError = useCallback((onRetry?: () => void) => {
        addToast({
            type: 'error',
            title: FRIENDLY_MESSAGES.server.title,
            message: FRIENDLY_MESSAGES.server.message,
            duration: 8000,
            action: onRetry ? { label: 'Опитай пак', onClick: onRetry } : undefined
        })
    }, [addToast])

    const authError = useCallback(() => {
        addToast({
            type: 'warning',
            title: FRIENDLY_MESSAGES.unauthorized.title,
            message: FRIENDLY_MESSAGES.unauthorized.message,
            duration: 6000
        })
    }, [addToast])

    return (
        <ToastContext.Provider value={{
            toasts,
            addToast,
            removeToast,
            success,
            error,
            warning,
            info,
            networkError,
            serverError,
            authError
        }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    )
}

// Individual Toast Component
function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    }

    const colors = {
        success: {
            bg: 'bg-emerald-900/95',
            border: 'border-emerald-500/50',
            icon: 'text-emerald-400',
            title: 'text-emerald-100',
            progress: 'from-emerald-400 to-emerald-500'
        },
        error: {
            bg: 'bg-red-900/95',
            border: 'border-red-500/50',
            icon: 'text-red-400',
            title: 'text-red-100',
            progress: 'from-red-400 to-red-500'
        },
        warning: {
            bg: 'bg-amber-900/95',
            border: 'border-amber-500/50',
            icon: 'text-amber-400',
            title: 'text-amber-100',
            progress: 'from-amber-400 to-amber-500'
        },
        info: {
            bg: 'bg-blue-900/95',
            border: 'border-blue-500/50',
            icon: 'text-blue-400',
            title: 'text-blue-100',
            progress: 'from-blue-400 to-blue-500'
        }
    }

    const style = colors[toast.type]

    return (
        <motion.div
            layout
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
            }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl ${style.bg} backdrop-blur-xl border ${style.border} shadow-2xl`}
        >
            <div className="p-4">
                {/* Close button */}
                <button
                    onClick={() => onRemove(toast.id)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${style.icon}`}>
                        {icons[toast.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                        <h4 className={`font-semibold ${style.title}`}>
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="text-sm text-gray-300 mt-0.5">
                                {toast.message}
                            </p>
                        )}

                        {/* Action button */}
                        {toast.action && (
                            <button
                                onClick={() => {
                                    toast.action?.onClick()
                                    onRemove(toast.id)
                                }}
                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.progress}`}
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                />
            )}
        </motion.div>
    )
}
