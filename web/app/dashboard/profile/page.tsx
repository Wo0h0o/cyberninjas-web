'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { EditProfileModal, ChangePasswordModal, NotificationsModal } from './components'
import { CheckCircle } from 'lucide-react'
import { LevelHeader } from '@/components/gamification/LevelHeader'
import { useUserProgress } from '@/hooks/useUserProgress'

export default function ProfilePage() {
    const { user, profile, signOut, refreshProfile } = useAuth()
    const router = useRouter()
    const { courseProgress, totalCompletedLessons, totalTimeWatched } = useUserProgress()
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showNotificationsModal, setShowNotificationsModal] = useState(false)
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    // Calculate completed courses
    const completedCourses = courseProgress.filter(cp => cp.progress_percentage === 100).length

    // Get user initials
    const getInitials = () => {
        if (!profile?.name) return user?.email?.[0]?.toUpperCase() || 'U'
        const parts = profile.name.split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return profile.name[0].toUpperCase()
    }

    // Get subscription label
    const getSubscriptionLabel = () => {
        if (profile?.subscription_tier === 'paid') return 'Платен план'
        return 'Безплатен план'
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/')
    }

    function showSuccess(message: string) {
        setSuccessMessage(message)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
    }

    return (
        <div className="space-y-6 sm:space-y-8 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Моят профил</h1>
                <p className="text-sm sm:text-base text-gray-400">
                    Управлявай акаунта си и преглеждай прогреса.
                </p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-yellow-hover flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.name || 'Avatar'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-white">{getInitials()}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                            {profile?.name || 'Потребител'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 truncate">{user?.email || 'Няма имейл'}</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${profile?.subscription_tier === 'paid'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-accent-yellow/20 text-accent-yellow'
                            }`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            {getSubscriptionLabel()}
                        </span>

                        {/* Show role badge for admins */}
                        {profile?.role === 'admin' && (
                            <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Admin
                            </span>
                        )}
                    </div>

                    {/* Edit Button - hidden on very small screens */}
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="hidden sm:block px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                    >
                        Редактирай
                    </button>
                </div>
            </motion.div>

            {/* Level Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <LevelHeader />
            </motion.div>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-3 gap-3 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{completedCourses}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Завършени курса</p>
                </div>
                <div className="p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalCompletedLessons}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Завършени урока</p>
                </div>
                <div className="p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalTimeWatched}ч</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Учебно време</p>
                </div>
            </motion.div>

            {/* Upgrade CTA - only show for free users */}
            {profile?.subscription_tier !== 'paid' && (
                <motion.div
                    className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent-yellow/10 to-yellow-500/10 border border-accent-yellow/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-accent-yellow/20 flex items-center justify-center flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow sm:w-8 sm:h-8">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Надгради до Платен план</h3>
                            <p className="text-sm sm:text-base text-gray-400">
                                Получи достъп до всички курсове и ексклузивно съдържание.
                            </p>
                        </div>
                        <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow-hover text-text-on-yellow font-medium transition-colors text-sm sm:text-base">
                            Надгради сега
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Settings */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h2 className="text-xl font-semibold text-white mb-4">Настройки</h2>
                <div className="space-y-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <span className="text-gray-300 group-hover:text-white transition-colors">Промени парола</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setShowNotificationsModal(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 01-3.46 0" />
                            </svg>
                            <span className="text-gray-300 group-hover:text-white transition-colors">Известия</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <polyline points="16,17 21,12 16,7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span className="text-red-400 group-hover:text-red-300 transition-colors">Изход</span>
                        </div>
                    </button>
                </div>
            </motion.section>

            {/* Modals */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentName={profile?.name || ''}
                currentEmail={user?.email || ''}
                currentAvatar={profile?.avatar_url || undefined}
                userId={user?.id || ''}
                onSuccess={async () => {
                    await refreshProfile()
                    showSuccess('Профилът е актуализиран успешно!')
                }}
            />

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => showSuccess('Паролата е сменена успешно!')}
            />

            <NotificationsModal
                isOpen={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                userId={user?.id || ''}
                onSuccess={() => showSuccess('Настройките са запазени!')}
            />

            {/* Success Toast */}
            {showSuccessToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl shadow-2xl"
                >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{successMessage}</span>
                </motion.div>
            )}
        </div>
    )
}
