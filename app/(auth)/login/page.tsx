'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await signIn(email, password)

        if (error) {
            setError(getErrorMessage(error.message))
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const getErrorMessage = (message: string): string => {
        if (message.includes('Invalid login credentials')) {
            return 'Грешен имейл или парола'
        }
        if (message.includes('Email not confirmed')) {
            return 'Моля потвърдете имейла си'
        }
        return 'Възникна грешка. Опитайте отново.'
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
                <p className="text-gray-400 mt-2">Влез в акаунта си</p>
            </div>

            {/* Form Card */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
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
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                Парола
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Забравена парола?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Влизане...
                            </>
                        ) : (
                            'Влез'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-sm">или</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Register Link */}
                <p className="text-center text-gray-400">
                    Нямаш акаунт?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Регистрирай се
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}
