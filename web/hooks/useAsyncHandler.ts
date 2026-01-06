'use client'

import { useCallback, useRef } from 'react'
import { useToast, FRIENDLY_MESSAGES } from '@/contexts/ToastContext'

type ErrorType = 'network' | 'server' | 'unauthorized' | 'forbidden' | 'notFound' | 'validation' | 'timeout' | 'generic'

interface FetchOptions {
    /** Show toast on error (default: true) */
    showToast?: boolean
    /** Custom error message override */
    errorMessage?: string
    /** Callback for retry action */
    onRetry?: () => void
    /** Silent mode - no toasts at all */
    silent?: boolean
}

/**
 * Determines error type from various error sources
 */
function getErrorType(error: unknown): ErrorType {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return 'network'
    }

    // Check for error codes/status
    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>

        // Supabase error codes
        const code = err.code as string | undefined
        const status = err.status as number | undefined
        const message = (err.message as string)?.toLowerCase() || ''

        // Network issues
        if (code === 'PGRST301' || message.includes('network') || message.includes('connection')) {
            return 'network'
        }

        // Auth errors
        if (code === 'PGRST401' || status === 401 || message.includes('jwt') || message.includes('token')) {
            return 'unauthorized'
        }

        // Forbidden
        if (status === 403 || code === '42501') {
            return 'forbidden'
        }

        // Not found
        if (status === 404 || code === 'PGRST116') {
            return 'notFound'
        }

        // Validation errors
        if (status === 400 || code === '23505' || code === '23503') {
            return 'validation'
        }

        // Server errors
        if (status && status >= 500) {
            return 'server'
        }

        // Timeout
        if (message.includes('timeout') || code === '57014') {
            return 'timeout'
        }
    }

    return 'generic'
}

/**
 * Hook for handling async operations with toast notifications
 */
export function useAsyncHandler() {
    const toast = useToast()
    const pendingRetryRef = useRef<(() => void) | null>(null)

    /**
     * Wraps an async function with error handling and toast notifications
     */
    const handleAsync = useCallback(async <T>(
        asyncFn: () => Promise<T>,
        options: FetchOptions = {}
    ): Promise<{ data: T | null; error: Error | null }> => {
        const { showToast = true, errorMessage, onRetry, silent = false } = options

        try {
            const data = await asyncFn()
            return { data, error: null }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))

            if (!silent && showToast) {
                const errorType = getErrorType(err)
                const friendlyMessage = FRIENDLY_MESSAGES[errorType]

                // Store retry function for later use
                pendingRetryRef.current = onRetry || null

                toast.addToast({
                    type: 'error',
                    title: errorMessage || friendlyMessage.title,
                    message: errorMessage ? undefined : friendlyMessage.message,
                    duration: onRetry ? 8000 : 5000,
                    action: onRetry ? {
                        label: 'Опитай пак',
                        onClick: () => {
                            onRetry()
                        }
                    } : undefined
                })
            }

            return { data: null, error }
        }
    }, [toast])

    /**
     * Shows a success toast
     */
    const showSuccess = useCallback((title: string, message?: string) => {
        toast.success(title, message)
    }, [toast])

    /**
     * Shows an error toast with optional retry
     */
    const showError = useCallback((
        title: string,
        message?: string,
        onRetry?: () => void
    ) => {
        toast.error(title, message, onRetry ? { label: 'Опитай пак', onClick: onRetry } : undefined)
    }, [toast])

    return {
        handleAsync,
        showSuccess,
        showError,
        toast
    }
}

/**
 * Utility function for handling Supabase responses
 */
export function handleSupabaseError(
    error: { message?: string; code?: string; details?: string } | null,
    toast: ReturnType<typeof useToast>,
    options: FetchOptions = {}
): boolean {
    if (!error) return false

    const { showToast = true, errorMessage, onRetry, silent = false } = options

    if (silent) return true

    if (showToast) {
        const errorType = getErrorType(error)
        const friendlyMessage = FRIENDLY_MESSAGES[errorType]

        toast.addToast({
            type: 'error',
            title: errorMessage || friendlyMessage.title,
            message: errorMessage ? undefined : friendlyMessage.message,
            duration: onRetry ? 8000 : 5000,
            action: onRetry ? { label: 'Опитай пак', onClick: onRetry } : undefined
        })
    }

    return true
}
