'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCourse } from '@/hooks/useCourses'
import { useCourseRating } from '@/hooks/useCourseRating'
import { LessonList, ProgressCircle } from '@/components/dashboard'
import { CourseRating } from '@/components/courses/CourseRating'

interface CoursePageProps {
    params: Promise<{ slug: string }>
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}ч ${mins}мин`
    }
    return `${mins} мин`
}

export default function CoursePage({ params }: CoursePageProps) {
    const resolvedParams = use(params)
    const { course, loading, error } = useCourse(resolvedParams.slug)

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
                <div className="h-96 rounded-2xl bg-white/[0.03] animate-pulse" />
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">Курсът не е намерен</h2>
                <p className="text-gray-400 mb-6">{error || 'Този курс не съществува или не е публикуван.'}</p>
                <Link href="/dashboard/courses" className="text-purple-400 hover:text-purple-300">
                    ← Обратно към курсовете
                </Link>
            </div>
        )
    }

    // Calculate total duration and lessons
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const totalDuration = course.modules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + l.duration_seconds, 0),
        0
    )

    // Get first lesson for CTA
    const firstLesson = course.modules[0]?.lessons[0]

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <motion.nav
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
                    Преглед
                </Link>
                <span className="text-gray-600">/</span>
                <Link href="/dashboard/courses" className="text-gray-500 hover:text-white transition-colors">
                    Академия
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white">{course.title}</span>
            </motion.nav>

            {/* Course Hero */}
            <motion.div
                className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Background */}
                <div className="absolute inset-0">
                    {course.thumbnail_url ? (
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-20"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {course.title}
                            </h1>
                            {course.description && (
                                <p className="text-lg text-gray-400 mb-6 max-w-2xl">
                                    {course.description}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow">
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                                    </svg>
                                    <span className="text-gray-300">{totalLessons} урока</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    <span className="text-gray-300">{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow">
                                        <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                                        <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                                    </svg>
                                    <span className="text-gray-300">{course.modules.length} модула</span>
                                </div>
                            </div>

                            {/* CTA */}
                            {firstLesson && (
                                <Link
                                    href={`/dashboard/courses/${course.slug}/lesson/${firstLesson.id}`}
                                    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-accent-yellow text-text-on-yellow font-medium hover:bg-accent-yellow-hover transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Започни курса
                                </Link>
                            )}
                        </div>

                        {/* Progress Circle (for future use) */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center">
                            <ProgressCircle percentage={0} size={120} />
                            <p className="text-sm text-gray-400 mt-3">Общ прогрес</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Course Content */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold text-white mb-6">Съдържание на курса</h2>
                <LessonList modules={course.modules} courseSlug={course.slug} />
            </motion.section>

            {/* Course Rating */}
            <motion.section
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h2 className="text-xl font-semibold text-white mb-4">Оценете курса</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Само закупилите курса могат да оценяват.
                </p>
                <CourseRating courseId={course.id} />
            </motion.section>
        </div>
    )
}
