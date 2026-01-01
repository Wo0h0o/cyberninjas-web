'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface CourseCardProps {
    course: {
        id: string
        slug: string
        title: string
        description: string | null
        thumbnail_url: string | null
        price_bgn: number
        difficulty: 'beginner' | 'intermediate' | 'advanced' | null
        // Enhanced fields
        instructor_name?: string | null
        instructor_avatar_url?: string | null
        learning_outcomes?: string[] | null
        tags?: string[] | null
        total_duration_minutes?: number
        students_count?: number
        average_rating?: number
        ratings_count?: number
        modules_count?: number
    }
    progress?: number
}

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} мин`
    if (mins === 0) return `${hours} ч`
    return `${hours} ч ${mins} мин`
}

function StarRating({ rating, count }: { rating: number; count: number }) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i < fullStars
                                ? 'text-accent-yellow'
                                : i === fullStars && hasHalfStar
                                    ? 'text-accent-yellow'
                                    : 'text-gray-600'
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({count})</span>
        </div>
    )
}

export function CourseCard({ course, progress }: CourseCardProps) {
    const hasProgress = progress !== undefined && progress > 0
    const hasEnhancedData = course.instructor_name || course.learning_outcomes?.length

    return (
        <Link href={`/dashboard/courses/${course.slug}`}>
            <motion.div
                className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 cursor-pointer h-full flex flex-col"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            >
                {/* Thumbnail - larger for academy cards */}
                <div className="relative h-52 overflow-hidden">
                    {course.thumbnail_url ? (
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/10 flex items-center justify-center">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-accent-yellow/40">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
                            </svg>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Price badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-accent-yellow text-text-on-yellow text-sm font-bold shadow-lg">
                        {course.price_bgn} лв.
                    </div>

                    {/* Difficulty badge */}
                    {course.difficulty && (
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${course.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : course.difficulty === 'intermediate'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            }`}>
                            {course.difficulty === 'beginner' ? 'Начинаещи' : course.difficulty === 'intermediate' ? 'Средно' : 'Напреднали'}
                        </div>
                    )}

                    {/* Rating - bottom of thumbnail */}
                    {course.average_rating !== undefined && course.average_rating > 0 && (
                        <div className="absolute bottom-3 left-3">
                            <StarRating rating={course.average_rating} count={course.ratings_count || 0} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-yellow transition-colors">
                        {course.title}
                    </h3>

                    {/* Description */}
                    {course.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                            {course.description}
                        </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                        {course.modules_count !== undefined && course.modules_count > 0 && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>{course.modules_count} модула</span>
                            </div>
                        )}
                        {course.total_duration_minutes !== undefined && course.total_duration_minutes > 0 && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatDuration(course.total_duration_minutes)}</span>
                            </div>
                        )}
                        {course.students_count !== undefined && course.students_count > 0 && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <span>{course.students_count} студенти</span>
                            </div>
                        )}
                    </div>

                    {/* Learning Outcomes */}
                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                        <div className="mb-4 space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Какво ще научиш:</p>
                            <ul className="space-y-1.5">
                                {course.learning_outcomes.slice(0, 3).map((outcome, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="line-clamp-1">{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.tags.slice(0, 4).map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 border border-white/10"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Spacer to push footer to bottom */}
                    <div className="flex-1" />

                    {/* Footer: Instructor + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        {/* Instructor */}
                        {course.instructor_name && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-yellow to-accent-yellow-hover flex items-center justify-center overflow-hidden">
                                    {course.instructor_avatar_url ? (
                                        <Image
                                            src={course.instructor_avatar_url}
                                            alt={course.instructor_name}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-text-on-yellow">
                                            {course.instructor_name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-gray-400">{course.instructor_name}</span>
                            </div>
                        )}

                        {/* Progress bar or CTA */}
                        {hasProgress ? (
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-accent-yellow to-accent-yellow-hover"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-accent-yellow">{progress}%</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-accent-yellow text-sm font-semibold group-hover:text-accent-yellow-hover transition-colors">
                                <span>Виж курса</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hover glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        boxShadow: '0 0 40px rgba(255, 255, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 0, 0.2)',
                    }}
                />
            </motion.div>
        </Link>
    )
}
