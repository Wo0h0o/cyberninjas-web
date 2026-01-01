'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Паролите не съвпадат')
            return
        }

        if (password.length < 6) {
            setError('Паролата трябва да е поне 6 символа')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError('Възникна грешка. Опитайте отново.')
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        }
    }

    if (success) {
        return (
            <motion.div
                className="w-full max-w-md text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Паролата е сменена!</h2>
                    <p className="text-gray-400 mb-6">
                        Пренасочване към платформата...
                    </p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <Image
                        src="/images/logo.svg"
                        alt="CyberNinjas"
                        width={60}
                        height={60}
                        className="mx-auto"
                    />
                </Link>
                <p className="text-gray-400 mt-4">Смяна на парола</p>
            </div>

            {/* Form Card */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                <p className="text-gray-400 text-sm mb-6 text-center">
                    Въведи новата си парола.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Нова парола
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow/50 focus:ring-1 focus:ring-accent-yellow/50 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Потвърди парола
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow/50 focus:ring-1 focus:ring-accent-yellow/50 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-accent-yellow text-text-on-yellow font-semibold hover:bg-accent-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Запазване...
                            </>
                        ) : (
                            'Смени паролата'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-gray-400 mt-6">
                    <Link href="/login" className="text-accent-yellow hover:text-accent-yellow-hover font-medium transition-colors">
                        ← Обратно към вход
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}
