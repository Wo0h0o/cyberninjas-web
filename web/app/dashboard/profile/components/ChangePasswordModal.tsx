'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ChangePasswordModal({
    isOpen,
    onClose,
    onSuccess
}: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Password strength calculation
    function getPasswordStrength(password: string): { score: number; label: string; color: string } {
        if (password.length === 0) return { score: 0, label: '', color: '' }

        let score = 0

        if (password.length >= 8) score++
        if (password.length >= 12) score++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 2) return { score, label: 'Слаба', color: 'text-red-400' }
        if (score <= 3) return { score, label: 'Средна', color: 'text-yellow-400' }
        return { score, label: 'Силна', color: 'text-green-400' }
    }

    const strength = getPasswordStrength(newPassword)

    function validateForm(): boolean {
        if (!newPassword || newPassword.length === 0) {
            setError('Въведи нова парола')
            return false
        }

        if (newPassword.length < 8) {
            setError('Паролата трябва да е поне 8 символа')
            return false
        }

        if (newPassword !== confirmPassword) {
            setError('Паролите не съвпадат')
            return false
        }

        return true
    }

    async function handleSave() {
        if (!validateForm()) return

        setError('')
        setLoading(true)

        try {
            // Update password using Supabase Auth
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            onSuccess()
            handleClose()
        } catch (err: any) {
            console.error('Error changing password:', err)
            setError(err.message || 'Грешка при смяна на парола. Опитай отново.')
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        if (!loading) {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setError('')
            setShowCurrent(false)
            setShowNew(false)
            setShowConfirm(false)
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
                                    Промени парола
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
                            <div className="p-6 space-y-4">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Нова парола
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow transition-colors disabled:opacity-50"
                                            placeholder="Поне 8 символа"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Password Strength */}
                                    {newPassword && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(strength.score / 5) * 100}%` }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`h-full ${strength.score <= 2 ? 'bg-red-500' :
                                                        strength.score <= 3 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${strength.color}`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Потвърди парола
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow transition-colors disabled:opacity-50"
                                            placeholder="Повтори новата парола"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Match indicator */}
                                    {confirmPassword && (
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            {newPassword === confirmPassword ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                    <span className="text-green-400">Паролите съвпадат</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                    <span className="text-red-400">Паролите не съвпадат</span>
                                                </>
                                            )}
                                        </div>
                                    )}
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
                                    {loading ? 'Запазване...' : 'Смени парола'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
