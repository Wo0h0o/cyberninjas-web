'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface CourseCardProps {
    course: {
        id: string
        slug: string
        title: string
        description: string | null
        thumbnail_url: string | null
        price_bgn: number
    }
    progress?: number // 0-100 percentage
}

export function CourseCard({ course, progress }: CourseCardProps) {
    const hasProgress = progress !== undefined && progress > 0

    return (
        <Link href={`/dashboard/courses/${course.slug}`}>
            <motion.div
                className="group relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 cursor-pointer"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden">
                    {course.thumbnail_url ? (
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-purple-400/50">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
                            </svg>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Price badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
                        {course.price_bgn} лв.
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {course.title}
                    </h3>

                    {course.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                            {course.description}
                        </p>
                    )}

                    {/* Progress bar */}
                    {hasProgress && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Прогрес</span>
                                <span className="text-purple-400">{progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    {!hasProgress && (
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                            <span>Виж курса</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
                </div>

                {/* Border glow on hover */}
                <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                        boxShadow: '0 0 0 1px rgba(139, 92, 246, 0)',
                    }}
                    whileHover={{
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.5)',
                    }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </Link>
    )
}
