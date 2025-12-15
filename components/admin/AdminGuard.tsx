'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AdminGuardProps {
    children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (profile?.role !== 'admin') {
                router.push('/dashboard')
            }
        }
    }, [user, profile, loading, router])

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Проверка на достъпа...</p>
                </div>
            </div>
        )
    }

    // Don't render if not admin
    if (!user || profile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Достъпът е забранен</h2>
                    <p className="text-gray-400 mb-6">Нямате администраторски права.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                        Към Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
