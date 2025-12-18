'use client'

import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { usePromptLibraries } from '@/hooks/usePrompts'
import { useUserProgress } from '@/hooks/useUserProgress'
import { CourseCard, ProgressCircle } from '@/components/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowRight, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react'

// Stats card component
function StatCard({
    icon,
    label,
    value,
    color,
    isEmpty = false,
    emptyMessage,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
    isEmpty?: boolean
    emptyMessage?: string
}) {
    return (
        <motion.div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10"
            whileHover={{ y: -2, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <div className="scale-75 sm:scale-100">{icon}</div>
                </div>
                <div className="min-w-0">
                    {isEmpty && emptyMessage ? (
                        <>
                            <p className="text-lg sm:text-xl font-semibold text-purple-300">{emptyMessage}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">{label}</p>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default function DashboardPage() {
    const { courses, loading } = useCourses()
    const { libraries, loading: librariesLoading } = usePromptLibraries()
    const { courseProgress, totalCompletedLessons, totalTimeWatched, loading: progressLoading } = useUserProgress()
    const { profile } = useAuth()

    // Get first name for greeting
    const firstName = profile?.name?.split(' ')[0] || 'там'

    // Check if user is first-time (no progress at all)
    const isFirstTime = !progressLoading && courseProgress.length === 0 && totalCompletedLessons === 0

    // Get most recent course
    const continueFrom = courseProgress[0]

    return (
        <div className="space-y-6 sm:space-y-10">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                    {isFirstTime ? `Добре дошъл в CyberNinjas, ${firstName}! 🎉` : `Здравей отново, ${firstName}! 👋`}
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                    {isFirstTime
                        ? 'Готов ли си да овладееш AI? Започни с нашия препоръчан път за начинаещи.'
                        : 'Продължи своето обучение и развий AI уменията си.'}
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                            <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                            <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                        </svg>
                    }
                    label="Активни курса"
                    value={courseProgress.length || courses.length}
                    color="bg-purple-500/20"
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    }
                    label="Промпт библиотеки"
                    value={librariesLoading ? '...' : libraries.length + 1}
                    color="bg-amber-500/20"
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    }
                    label="Завършени лекции"
                    value={totalCompletedLessons}
                    isEmpty={isFirstTime}
                    emptyMessage="Започни!"
                    color="bg-green-500/20"
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    }
                    label="Часа учене"
                    value={totalTimeWatched || 0}
                    isEmpty={isFirstTime}
                    emptyMessage="Първи стъпки"
                    color="bg-blue-500/20"
                />
            </motion.div>

            {/* Continue Learning / First Time CTA */}
            {isFirstTime ? (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-blue-500/20 border border-purple-500/30 p-8"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <span className="text-sm font-medium text-purple-300">Препоръчано за начинаещи</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Започни своето AI пътуване
                        </h2>
                        <p className="text-gray-300 mb-6 max-w-2xl">
                            Изградихме специален път за начинаещи. Започни с основите на AI и стигни до напреднали техники за автоматизация.
                        </p>
                        <Link
                            href="/dashboard/courses"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all group"
                        >
                            <Play className="w-5 h-5" />
                            Започни първия си курс
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.section>
            ) : continueFrom ? (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Play className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Продължи откъдето спря</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <Link
                                href={`/dashboard/courses/${continueFrom.course_slug}`}
                                className="group"
                            >
                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-2">
                                    {continueFrom.course_title}
                                </h3>
                                {continueFrom.last_module_title && continueFrom.last_lesson_title && (
                                    <p className="text-sm text-gray-400 mb-3">
                                        {continueFrom.last_module_title} → {continueFrom.last_lesson_title}
                                    </p>
                                )}
                            </Link>

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-400">
                                        {continueFrom.completed_lessons} от {continueFrom.total_lessons} лекции
                                    </span>
                                    <span className="text-purple-400 font-medium">
                                        {continueFrom.progress_percentage}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${continueFrom.progress_percentage}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {continueFrom.last_accessed_at && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    Последно гледано: {new Date(continueFrom.last_accessed_at).toLocaleDateString('bg-BG', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/dashboard/courses/${continueFrom.course_slug}`}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all group self-start"
                        >
                            <Play className="w-5 h-5" />
                            Продължи
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.section>
            ) : null}

            {/* All Courses Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        {isFirstTime ? 'Разгледай курсовете' : (continueFrom ? 'Други курсове' : 'Всички курсове')}
                    </h2>
                    <Link
                        href="/dashboard/courses"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                        Виж всички
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-80 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"
                            />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.slice(0, continueFrom ? 2 : 3).map((course, index) => {
                            const progress = courseProgress.find(cp => cp.course_id === course.id)
                            return (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 * index }}
                                >
                                    <CourseCard course={course} progress={progress?.progress_percentage} />
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                                <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                                <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                                <path d="M8 7H16M8 11H14" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Няма налични курсове</h3>
                        <p className="text-gray-400 text-sm">Курсовете ще се появят тук скоро.</p>
                    </div>
                )}
            </motion.section>

            {/* Quick Actions */}
            <motion.section
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Link
                    href="/dashboard/prompts"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                Промпт библиотеки
                            </h3>
                            <p className="text-sm text-gray-400">
                                150+ готови промпта за ChatGPT & AI
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                <Link
                    href="/dashboard/platforms"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                AI Платформи
                            </h3>
                            <p className="text-sm text-gray-400">
                                35 AI инструмента за всяка задача
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </motion.section>
        </div>
    )
}
