'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NotificationPreferences {
    email_new_courses: boolean
    email_weekly_summary: boolean
    email_achievements: boolean
    email_streak_reminders: boolean
}

interface NotificationsModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onSuccess: () => void
}

export function NotificationsModal({
    isOpen,
    onClose,
    userId,
    onSuccess
}: NotificationsModalProps) {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email_new_courses: true,
        email_weekly_summary: true,
        email_achievements: true,
        email_streak_reminders: true
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    // Fetch current preferences
    useEffect(() => {
        if (isOpen && userId) {
            fetchPreferences()
        }
    }, [isOpen, userId])

    async function fetchPreferences() {
        setFetching(true)
        try {
            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error) {
                // If no preferences exist, create default ones
                if (error.code === 'PGRST116') {
                    await createDefaultPreferences()
                } else {
                    throw error
                }
            } else if (data) {
                setPreferences({
                    email_new_courses: (data as any).email_new_courses,
                    email_weekly_summary: (data as any).email_weekly_summary,
                    email_achievements: (data as any).email_achievements,
                    email_streak_reminders: (data as any).email_streak_reminders
                })
            }
        } catch (err: any) {
            console.error('Error fetching preferences:', err)
            setError('Грешка при зареждане. Опитай отново.')
        } finally {
            setFetching(false)
        }
    }

    async function createDefaultPreferences() {
        try {
            const { error } = await supabase
                .from('notification_preferences')
                .insert({ user_id: userId } as any)

            if (error) throw error
        } catch (err) {
            console.error('Error creating default preferences:', err)
        }
    }

    async function handleSave() {
        setError('')
        setLoading(true)

        try {
            const { error: updateError } = await supabase
                .from('notification_preferences')
                .update(preferences as any)
                .eq('user_id', userId)

            if (updateError) throw updateError

            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('Error updating preferences:', err)
            setError('Грешка при запазване. Опитай отново.')
        } finally {
            setLoading(false)
        }
    }

    function togglePreference(key: keyof NotificationPreferences) {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    function handleClose() {
        if (!loading) {
            setError('')
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent-yellow/20 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-accent-yellow" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Известия
                                    </h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                {fetching ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-white/10 border-t-accent-yellow rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-400">
                                            Избери какви имейл известия искаш да получаваш.
                                        </p>

                                        {/* Toggles */}
                                        <div className="space-y-3">
                                            {/* New Courses */}
                                            <ToggleItem
                                                label="Нови курсове"
                                                description="Когато добавим нов курс"
                                                checked={preferences.email_new_courses}
                                                onChange={() => togglePreference('email_new_courses')}
                                                disabled={loading}
                                            />

                                            {/* Weekly Summary */}
                                            <ToggleItem
                                                label="Седмична справка"
                                                description="Твоя напредък за седмицата"
                                                checked={preferences.email_weekly_summary}
                                                onChange={() => togglePreference('email_weekly_summary')}
                                                disabled={loading}
                                            />

                                            {/* Achievements */}
                                            <ToggleItem
                                                label="Постижения"
                                                description="Нови отключени постижения"
                                                checked={preferences.email_achievements}
                                                onChange={() => togglePreference('email_achievements')}
                                                disabled={loading}
                                            />

                                            {/* Streak Reminders */}
                                            <ToggleItem
                                                label="Напомняния за streak"
                                                description="За да не губиш streak-a си"
                                                checked={preferences.email_streak_reminders}
                                                onChange={() => togglePreference('email_streak_reminders')}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                    Отказ
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading || fetching}
                                    className="flex-1 px-4 py-2 rounded-lg bg-accent-yellow text-text-on-yellow font-medium hover:bg-accent-yellow-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Запазване...' : 'Запази'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// Toggle Item Component
interface ToggleItemProps {
    label: string
    description: string
    checked: boolean
    onChange: () => void
    disabled?: boolean
}

function ToggleItem({ label, description, checked, onChange, disabled }: ToggleItemProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10">
            <div className="flex-1 mr-4">
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{description}</div>
            </div>
            <button
                onClick={onChange}
                disabled={disabled}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-accent-yellow' : 'bg-white/10'
                    }`}
            >
                <motion.div
                    initial={false}
                    animate={{ x: checked ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                />
            </button>
        </div>
    )
}
