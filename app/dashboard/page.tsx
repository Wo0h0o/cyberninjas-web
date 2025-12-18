'use client'

import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { usePromptLibraries } from '@/hooks/usePrompts'
import { CourseCard, ProgressCircle } from '@/components/dashboard'
import { useAuth } from '@/contexts/AuthContext'

// Stats card component - mobile optimized
function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
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
                    <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{label}</p>
                </div>
            </div>
        </motion.div>
    )
}

export default function DashboardPage() {
    const { courses, loading } = useCourses()
    const { libraries, loading: librariesLoading } = usePromptLibraries()
    const { profile } = useAuth()

    // Get first name for greeting
    const firstName = profile?.name?.split(' ')[0] || 'там'

    return (
        <div className="space-y-6 sm:space-y-10">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                    Добре дошъл, {firstName}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                    Продължи своето обучение и развий AI уменията си.
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
                    label="Курса"
                    value={courses.length}
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
                    label="Завършени урока"
                    value={0}
                    color="bg-green-500/20"
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    }
                    label="Часа гледано"
                    value="0"
                    color="bg-blue-500/20"
                />
            </motion.div>

            {/* Continue Learning Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Продължи обучението</h2>
                    <a href="/dashboard/courses" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Виж всички →
                    </a>
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
                        {courses.slice(0, 3).map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                            >
                                <CourseCard course={course} />
                            </motion.div>
                        ))}
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
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <a
                    href="/dashboard/courses"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                Разгледай курсовете
                            </h3>
                            <p className="text-sm text-gray-400">
                                Открий нови умения и знания
                            </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>

                <a
                    href="/dashboard/prompts"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                Промпт библиотеки
                            </h3>
                            <p className="text-sm text-gray-400">
                                Готови промптове за ChatGPT & AI
                            </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>

                <a
                    href="/dashboard/profile"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                Моят профил
                            </h3>
                            <p className="text-sm text-gray-400">
                                Настройки и прогрес
                            </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>
            </motion.section>
        </div>
    )
}
