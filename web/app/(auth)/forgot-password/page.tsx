'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await resetPassword(email)

        if (error) {
            setError('Възникна грешка. Опитайте отново.')
            setLoading(false)
        } else {
            setSuccess(true)
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
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Имейл изпратен!</h2>
                    <p className="text-gray-400 mb-6">
                        Провери пощата си за линк за смяна на паролата.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 rounded-xl bg-accent-yellow text-text-on-yellow font-semibold hover:bg-accent-yellow-hover transition-colors"
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
                    <h1 className="text-3xl font-bold">
                        Cyber<span className="gradient-text">Ninjas</span>
                    </h1>
                </Link>
                <p className="text-gray-400 mt-2">Забравена парола</p>
            </div>

            {/* Form Card */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                <p className="text-gray-400 text-sm mb-6 text-center">
                    Въведи имейла си и ще ти изпратим линк за смяна на паролата.
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-accent-yellow text-text-on-yellow font-semibold hover:bg-accent-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Изпращане...
                            </>
                        ) : (
                            'Изпрати линк'
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
