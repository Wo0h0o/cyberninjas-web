'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, BottomNav } from '@/components/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import '@/app/globals.css'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="aurora">
                    <div className="aurora-blob aurora-blob-1" />
                    <div className="aurora-blob aurora-blob-2" />
                    <div className="aurora-blob aurora-blob-3" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Зареждане...</p>
                </div>
            </div>
        )
    }

    // Don't render dashboard if not authenticated
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Aurora Background */}
            <div className="aurora">
                <div className="aurora-blob aurora-blob-1" />
                <div className="aurora-blob aurora-blob-2" />
                <div className="aurora-blob aurora-blob-3" />
            </div>

            {/* Sidebar - Desktop Only */}
            <Sidebar />

            {/* Bottom Navigation - Mobile Only */}
            <BottomNav />

            {/* Main Content */}
            <main className="lg:pl-72 min-h-screen pb-20 lg:pb-0">
                <div className="p-4 sm:p-6 lg:p-10 pt-6 lg:pt-10">
                    {children}
                </div>
            </main>
        </div>
    )
}

