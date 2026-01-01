'use client'

import { motion } from 'framer-motion'
import { useCourses } from '@/hooks/useCourses'
import { CourseCard } from '@/components/dashboard'

export default function CoursesPage() {
    const { courses, loading } = useCourses()

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">Академия</h1>
                <p className="text-gray-400">
                    Разгледай всички налични курсове и започни своето обучение.
                </p>
            </motion.div>

            {/* Courses Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-80 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"
                        />
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                        >
                            <CourseCard course={course} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    className="text-center py-20 rounded-2xl bg-white/[0.03] border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                            <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                            <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                            <path d="M8 7H16M8 11H14" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3">Няма налични курсове</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Курсовете ще се появят тук след добавяне в базата данни.
                        Увери се, че seed данните са изпълнени в Supabase.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
