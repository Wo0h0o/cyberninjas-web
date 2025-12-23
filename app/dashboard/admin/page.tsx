'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: 'Академия', value: '-', icon: '📚', href: '/dashboard/admin/courses' },
        { label: 'Библиотеки', value: '-', icon: '📖', href: '/dashboard/admin/libraries' },
        { label: 'AI команди', value: '-', icon: '📝', href: '/dashboard/admin/libraries' },
    ])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch course count
                const { count: courseCount } = await supabase
                    .from('courses')
                    .select('*', { count: 'exact', head: true })

                // Fetch library count
                const { count: libraryCount } = await supabase
                    .from('prompt_libraries')
                    .select('*', { count: 'exact', head: true })

                // Fetch prompt count
                const { count: promptCount } = await supabase
                    .from('prompts')
                    .select('*', { count: 'exact', head: true })

                setStats([
                    { label: 'Академия', value: String(courseCount || 0), icon: '📚', href: '/dashboard/admin/courses' },
                    { label: 'Библиотеки', value: String(libraryCount || 0), icon: '📖', href: '/dashboard/admin/libraries' },
                    { label: 'AI команди', value: String(promptCount || 0), icon: '📝', href: '/dashboard/admin/libraries' },
                ])
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {stats.map((stat, index) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors group"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl">{stat.icon}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-purple-400 transition-colors">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                            <p className="text-4xl font-bold text-white mb-1">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    stat.value
                                )}
                            </p>
                            <p className="text-gray-400">{stat.label}</p>
                        </motion.div>
                    </Link>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-lg font-semibold text-white mb-4">Бързи действия</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/admin/libraries"
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">Добави библиотека</h3>
                            <p className="text-sm text-gray-400">Създай нова библиотека с промптове</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/admin/libraries"
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Редактирай съдържание</h3>
                            <p className="text-sm text-gray-400">Промени съществуващите библиотеки</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
