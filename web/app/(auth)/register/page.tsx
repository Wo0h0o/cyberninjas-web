'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Паролите не съвпадат')
            setLoading(false)
            return
        }

        // Validate password length
        if (password.length < 6) {
            setError('Паролата трябва да е поне 6 символа')
            setLoading(false)
            return
        }

        const { error } = await signUp(email, password, name)

        if (error) {
            setError(getErrorMessage(error.message))
            setLoading(false)
        } else {
            setSuccess(true)
        }
    }

    const getErrorMessage = (message: string): string => {
        if (message.includes('already registered')) {
            return 'Този имейл вече е регистриран'
        }
        if (message.includes('valid email')) {
            return 'Моля въведете валиден имейл'
        }
        return 'Възникна грешка. Опитайте отново.'
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
                    <h2 className="text-2xl font-bold text-white mb-3">Регистрацията е успешна!</h2>
                    <p className="text-gray-400 mb-6">
                        Изпратихме ти имейл за потвърждение. Моля провери пощата си.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow-hover text-text-on-yellow font-semibold transition-colors"
                    >
                        Към вход
                    </Link>
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
                    <img
                        src="/images/logo.svg"
                        alt="CyberNinjas"
                        className="h-12 w-auto mx-auto mb-4"
                    />
                </Link>
                <p className="text-gray-400 mt-2">Създай акаунт</p>
            </div>

            {/* Form Card */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
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

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Име
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow/50 focus:ring-1 focus:ring-accent-yellow/50 transition-colors"
                            placeholder="Иван Иванов"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Имейл
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow/50 focus:ring-1 focus:ring-accent-yellow/50 transition-colors"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Парола
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
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow-hover text-text-on-yellow font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-text-on-yellow border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Регистриране...
                            </>
                        ) : (
                            'Създай акаунт'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-sm">или</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Login Link */}
                <p className="text-center text-gray-400">
                    Вече имаш акаунт?{' '}
                    <Link href="/login" className="text-accent-yellow hover:text-accent-yellow-hover font-medium transition-colors">
                        Влез
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}
