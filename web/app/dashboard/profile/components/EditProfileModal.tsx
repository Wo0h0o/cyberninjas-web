'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AvatarUpload } from './AvatarUpload'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    currentName: string
    currentEmail: string
    currentAvatar?: string
    userId: string
    onSuccess: () => void
}

export function EditProfileModal({
    isOpen,
    onClose,
    currentName,
    currentEmail,
    currentAvatar,
    userId,
    onSuccess
}: EditProfileModalProps) {
    const [name, setName] = useState(currentName)
    const [avatarUrl, setAvatarUrl] = useState(currentAvatar)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSave() {
        // Validation
        if (!name || name.trim().length === 0) {
            setError('Името е задължително')
            return
        }

        if (name.length > 100) {
            setError('Името е твърде дълго (макс 100 символа)')
            return
        }

        setError('')
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('Not authenticated')
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ name: name.trim() } as any)
                .eq('id', user.id)

            if (updateError) throw updateError

            onSuccess()
            onClose()
        } catch (err) {
            console.error('Error updating profile:', err)
            setError('Грешка при запазване. Опитай отново.')
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        if (!loading) {
            setName(currentName) // Reset on cancel
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
                                <h2 className="text-xl font-semibold text-white">
                                    Редактирай профил
                                </h2>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Avatar Upload */}
                                <AvatarUpload
                                    currentAvatar={avatarUrl}
                                    userId={userId}
                                    onUploadSuccess={(url) => {
                                        setAvatarUrl(url)
                                        setError('')
                                    }}
                                    onUploadError={(err) => setError(err)}
                                />

                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Име
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow transition-colors disabled:opacity-50"
                                        placeholder="Въведи име"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={currentEmail}
                                        disabled
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Email-ът не може да бъде променен
                                    </p>
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
                                    disabled={loading}
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
