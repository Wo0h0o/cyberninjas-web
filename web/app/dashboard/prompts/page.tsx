'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePromptLibraries } from '@/hooks/usePrompts'

export default function PromptsPage() {
    const { libraries, loading } = usePromptLibraries()

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">AI команди</h1>
                <p className="text-gray-400">
                    Готови промптове за ChatGPT, Claude, Midjourney и други AI инструменти.
                </p>
            </motion.div>

            {/* Libraries Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-64 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"
                        />
                    ))}
                </div>
            ) : libraries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {libraries.map((library, index) => (
                        <motion.div
                            key={library.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                            <Link href={`/dashboard/prompts/${library.slug}`}>
                                <div className="group relative rounded-2xl bg-white/[0.03] border border-white/10 hover:border-accent-yellow/30 transition-all cursor-pointer overflow-hidden">
                                    {/* Cover Image */}
                                    <div className="relative h-40 overflow-hidden">
                                        {library.thumbnail_url ? (
                                            <img
                                                src={library.thumbnail_url}
                                                alt={library.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-accent-yellow/20 via-yellow-500/10 to-orange-500/20 flex items-center justify-center">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-yellow/50">
                                                    <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                                                    <path d="M12 12L20 7.5" />
                                                    <path d="M12 12V21" />
                                                    <path d="M12 12L4 7.5" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                                        {/* Premium Badge */}
                                        {library.is_premium && (
                                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-accent-yellow to-yellow-500 text-xs font-bold text-black shadow-lg">
                                                PRO
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Title */}
                                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-yellow transition-colors">
                                            {library.title}
                                        </h3>

                                        {/* Description */}
                                        {library.description && (
                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                                {library.description}
                                            </p>
                                        )}

                                        {/* Footer with arrow */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Виж повече</span>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-accent-yellow group-hover:translate-x-1 transition-all">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                        style={{
                                            background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 0, 0.15), transparent 60%)',
                                        }}
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 rounded-2xl bg-white/[0.03] border border-white/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-accent-yellow/20 flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow">
                            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                            <path d="M12 12L20 7.5" />
                            <path d="M12 12V21" />
                            <path d="M12 12L4 7.5" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3">Няма налични библиотеки</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Промпт библиотеките ще се появят тук скоро.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
