'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useGuides } from '@/hooks/useGuides'
import { BookOpen, Clock, FileText } from 'lucide-react'

export default function GuidesPage() {
    const { guides, loading } = useGuides()

    const difficultyConfig = {
        beginner: {
            label: 'Начинаещи',
            className: 'bg-green-500/20 text-green-300 border-green-500/30'
        },
        intermediate: {
            label: 'Средно ниво',
            className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
        advanced: {
            label: 'Напреднали',
            className: 'bg-red-500/20 text-red-300 border-red-500/30'
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Ръководства</h1>
                <p className="text-gray-400">
                    Задълбочени ръководства с множество формати за учене
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-3xl bg-white/[0.03] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides.map((guide, index) => {
                        const config = guide.difficulty ? difficultyConfig[guide.difficulty] : difficultyConfig.beginner

                        return (
                            <motion.div
                                key={guide.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                            >
                                <Link
                                    href={`/dashboard/guides/${guide.slug}`}
                                    className="group block h-full"
                                >
                                    <div className="relative h-full rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.05]">
                                        {/* Thumbnail */}
                                        {guide.thumbnail_url && (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={guide.thumbnail_url}
                                                    alt={guide.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        <div className="p-6">
                                            {/* Difficulty Badge */}
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className} mb-3`}>
                                                {config.label}
                                            </span>

                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                                {guide.title}
                                            </h3>

                                            {guide.description && (
                                                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                                    {guide.description}
                                                </p>
                                            )}

                                            {/* Format Icons */}
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    <span>Текст</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>PDF</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Видео</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {!loading && guides.length === 0 && (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-white mb-3">Няма налични ръководства</h3>
                    <p className="text-gray-400">Ръководствата ще се появят тук скоро.</p>
                </div>
            )}
        </div>
    )
}
