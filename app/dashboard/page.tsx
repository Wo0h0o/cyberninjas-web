'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { usePromptLibraries } from '@/hooks/usePrompts'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useUserLevel } from '@/hooks/useUserLevel'
import { CourseCard } from '@/components/dashboard'
import { LevelHeader, AchievementToast, NinjaCompanion } from '@/components/gamification'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowRight, Play, CheckCircle2, Clock, Sparkles, BookOpen, Star, Zap, Target } from 'lucide-react'

// Circular progress component
function CircularProgress({ value, size = 80, strokeWidth = 8, color = "purple" }: {
    value: number
    size?: number
    strokeWidth?: number
    color?: string
}) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    const colorMap: Record<string, string> = {
        purple: '#a855f7',
        amber: '#f59e0b',
        green: '#10b981',
        blue: '#3b82f6',
    }

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="none"
            />
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colorMap[color]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                    strokeDasharray: circumference,
                }}
            />
        </svg>
    )
}

// Enhanced stats card with circular progress
function StatCard({
    icon,
    label,
    value,
    color,
    isEmpty = false,
    emptyMessage,
    showCircular = false,
    percentage,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
    isEmpty?: boolean
    emptyMessage?: string
    showCircular?: boolean
    percentage?: number
}) {
    return (
        <motion.div
            className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden group"
            whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.4)' }}
            transition={{ duration: 0.2 }}
        >
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500" />

            <div className="relative flex items-center gap-4">
                {showCircular && percentage !== undefined ? (
                    <div className="relative flex-shrink-0">
                        <CircularProgress value={percentage} size={64} strokeWidth={6} color={color.includes('purple') ? 'purple' : color.includes('amber') ? 'amber' : color.includes('green') ? 'green' : 'blue'} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{value}</span>
                        </div>
                    </div>
                ) : (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    {isEmpty && emptyMessage ? (
                        <>
                            <p className="text-base font-semibold text-purple-300">{emptyMessage}</p>
                            <p className="text-xs text-gray-500 truncate">{label}</p>
                        </>
                    ) : (
                        <>
                            {!showCircular && <p className="text-2xl font-bold text-white">{value}</p>}
                            <p className="text-sm text-gray-400 truncate">{label}</p>
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

    // Calculate overall progress percentage
    const overallProgress = courseProgress.length > 0
        ? Math.round(courseProgress.reduce((acc, cp) => acc + cp.progress_percentage, 0) / courseProgress.length)
        : 0

    return (
        <div className="space-y-8">
            {/* Achievement Toast */}
            <AchievementToast />

            {/* Ninja Companion */}
            <NinjaCompanion />

            {/* Level Header */}
            <LevelHeader />

            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">
                    {isFirstTime ? `Добре дошъл в CyberNinjas, ${firstName}! 🎉` : `Здравей отново, ${firstName}! 👋`}
                </h1>
                <p className="text-base text-gray-400">
                    {isFirstTime
                        ? 'Готов ли си да овладееш AI? Започни с нашия препоръчан път за начинаещи.'
                        : 'Продължи своето обучение и развий AI уменията си.'}
                </p>
            </motion.div>

            {/* Bento Grid Layout - Stats + Featured */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {/* Left: Stats Grid (8 cols) */}
                <div className="lg:col-span-8 grid grid-cols-2 gap-4">
                    <StatCard
                        icon={<BookOpen className="w-6 h-6 text-purple-400" />}
                        label="Активни курса"
                        value={courseProgress.length || courses.length}
                        color="bg-purple-500/20"
                        showCircular={courseProgress.length > 0}
                        percentage={courseProgress.length > 0 ? Math.min(100, (courseProgress.length / courses.length) * 100) : 0}
                    />
                    <StatCard
                        icon={<Star className="w-6 h-6 text-amber-400" />}
                        label="Промпт библиотеки"
                        value={librariesLoading ? '...' : libraries.length + 1}
                        color="bg-amber-500/20"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
                        label="Завършени лекции"
                        value={totalCompletedLessons}
                        isEmpty={isFirstTime}
                        emptyMessage="Започни!"
                        color="bg-green-500/20"
                        showCircular={!isFirstTime && totalCompletedLessons > 0}
                        percentage={overallProgress}
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6 text-blue-400" />}
                        label="Часа учене"
                        value={totalTimeWatched || 0}
                        isEmpty={isFirstTime}
                        emptyMessage="Първи стъпки"
                        color="bg-blue-500/20"
                    />
                </div>

                {/* Right: Quick Insight Card (4 cols) */}
                <div className="lg:col-span-4">
                    <motion.div
                        className="h-full p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-purple-500/20 border border-purple-500/30 relative overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm font-medium text-purple-300">
                                        {isFirstTime ? 'Твоята цел' : 'Прогрес'}
                                    </span>
                                </div>
                                {isFirstTime ? (
                                    <>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Завърши първия урок
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            90% от студентите завършват първия урок за под 10 минути!
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold text-white mb-2">
                                            {overallProgress}%
                                        </div>
                                        <p className="text-sm text-gray-300">
                                            Среден прогрес във всички курсове
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mt-4">
                                <Zap className="w-4 h-4" />
                                <span>Продължавай така!</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Continue Learning / First Time CTA */}
            {isFirstTime ? (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-blue-500/20 border border-purple-500/30"
                >
                    <div className="grid lg:grid-cols-2 gap-8 p-8">
                        {/* Left: Content */}
                        <div className="relative z-10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-medium text-purple-300">Препоръчано за начинаещи</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Започни своето AI пътуване
                            </h2>
                            <p className="text-gray-300 mb-6 text-lg">
                                Изградихме специален път за начинаещи. Започни с основите на AI и стигни до напреднали техники за автоматизация.
                            </p>
                            <Link
                                href="/dashboard/courses"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all group w-fit"
                            >
                                <Play className="w-5 h-5" />
                                Започни първия си курс
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Right: Illustration */}
                        <div className="relative hidden lg:flex items-center justify-center">
                            <div className="relative w-64 h-64">
                                {/* Animated circles */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.5, 0.3],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute inset-8 rounded-full bg-fuchsia-500/20 blur-xl"
                                    animate={{
                                        scale: [1.2, 1, 1.2],
                                        opacity: [0.5, 0.3, 0.5],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                {/* Icon in center */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                                        <Sparkles className="w-16 h-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            ) : continueFrom ? (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-8"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Play className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-semibold text-white">Продължи откъдето спря</h2>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: Course Info */}
                        <div className="lg:col-span-2">
                            <Link
                                href={`/dashboard/courses/${continueFrom.course_slug}`}
                                className="group block"
                            >
                                <h3 className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors mb-3">
                                    {continueFrom.course_title}
                                </h3>
                                {continueFrom.last_module_title && continueFrom.last_lesson_title && (
                                    <p className="text-base text-gray-400 mb-4">
                                        {continueFrom.last_module_title} → {continueFrom.last_lesson_title}
                                    </p>
                                )}
                            </Link>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-gray-400">
                                        {continueFrom.completed_lessons} от {continueFrom.total_lessons} лекции
                                    </span>
                                    <span className="text-purple-400 font-semibold text-lg">
                                        {continueFrom.progress_percentage}%
                                    </span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${continueFrom.progress_percentage}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {continueFrom.last_accessed_at && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    Последно гледано: {new Date(continueFrom.last_accessed_at).toLocaleDateString('bg-BG', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: CTA */}
                        <div className="flex items-center justify-center lg:justify-end">
                            <Link
                                href={`/dashboard/courses/${continueFrom.course_slug}`}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all group"
                            >
                                <Play className="w-6 h-6" />
                                <span>Продължи</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
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
                    <h2 className="text-2xl font-semibold text-white">
                        {isFirstTime ? 'Разгледай курсовете' : (continueFrom ? 'Други курсове' : 'Всички курсове')}
                    </h2>
                    <Link
                        href="/dashboard/courses"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
                    >
                        Виж всички
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-80 rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse"
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
                    <div className="text-center py-20 rounded-3xl bg-white/[0.03] border border-white/10">
                        <div className="w-20 h-20 rounded-3xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Няма налични курсове</h3>
                        <p className="text-gray-400">Курсовете ще се появят тук скоро.</p>
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
                    className="group p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Star className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-amber-300 transition-colors mb-1">
                                Промпт библиотеки
                            </h3>
                            <p className="text-sm text-gray-400">
                                150+ готови промпта за ChatGPT & AI
                            </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-2 transition-all" />
                    </div>
                </Link>

                <Link
                    href="/dashboard/platforms"
                    className="group p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors mb-1">
                                AI Платформи
                            </h3>
                            <p className="text-sm text-gray-400">
                                35 AI инструмента за всяка задача
                            </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all" />
                    </div>
                </Link>
            </motion.section>
        </div>
    )
}
