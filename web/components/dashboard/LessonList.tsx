'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import type { ModuleWithLessons, Lesson, UserProgress } from '@/lib/types'

interface LessonListProps {
    modules: ModuleWithLessons[]
    currentLessonId?: string
    progress?: UserProgress[]
    onLessonClick?: (lesson: Lesson) => void
    courseSlug: string
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function LessonList({
    modules,
    currentLessonId,
    progress = [],
    onLessonClick,
    courseSlug
}: LessonListProps) {
    const [expandedModules, setExpandedModules] = useState<string[]>(
        [modules[0]?.id].filter(Boolean) // Only first module expanded by default
    )

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const getLessonStatus = (lessonId: string): 'completed' | 'current' | 'locked' | 'available' => {
        if (lessonId === currentLessonId) return 'current'
        const lessonProgress = progress.find(p => p.lesson_id === lessonId)
        if (lessonProgress?.is_completed) return 'completed'
        return 'available'
    }

    return (
        <div className="space-y-3">
            {modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules.includes(module.id)
                const completedLessons = module.lessons.filter(l =>
                    progress.some(p => p.lesson_id === l.id && p.is_completed)
                ).length

                return (
                    <div
                        key={module.id}
                        className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
                    >
                        {/* Module Header */}
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent-yellow/20 flex items-center justify-center text-sm font-medium text-accent-yellow">
                                    {moduleIndex + 1}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-medium text-white">{module.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        {completedLessons}/{module.lessons.length} урока
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </motion.div>
                        </button>

                        {/* Lessons */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-1">
                                        {module.lessons.map((lesson, lessonIndex) => {
                                            const status = getLessonStatus(lesson.id)
                                            const href = `/dashboard/courses/${courseSlug}/lesson/${lesson.id}`

                                            return (
                                                <a
                                                    key={lesson.id}
                                                    href={href}
                                                    onClick={(e) => {
                                                        if (onLessonClick) {
                                                            e.preventDefault()
                                                            onLessonClick(lesson)
                                                        }
                                                    }}
                                                    className={clsx(
                                                        'flex items-center gap-3 p-3 rounded-lg transition-all',
                                                        status === 'current' && 'bg-accent-yellow/20 border border-accent-yellow/30',
                                                        status !== 'current' && 'hover:bg-white/[0.03]'
                                                    )}
                                                >
                                                    {/* Status Icon */}
                                                    <div className={clsx(
                                                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                                                        status === 'completed' && 'bg-green-500/20 text-green-400',
                                                        status === 'current' && 'bg-accent-yellow/30 text-accent-yellow',
                                                        status === 'available' && 'bg-white/10 text-gray-400',
                                                        status === 'locked' && 'bg-white/5 text-gray-600'
                                                    )}>
                                                        {status === 'completed' ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <path d="M20 6L9 17l-5-5" />
                                                            </svg>
                                                        ) : status === 'current' ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        ) : (
                                                            <span className="text-xs">{lessonIndex + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Lesson Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={clsx(
                                                            'text-sm font-medium truncate',
                                                            status === 'current' ? 'text-white' : 'text-gray-300'
                                                        )}>
                                                            {lesson.title}
                                                        </p>
                                                    </div>

                                                    {/* Duration & Preview Badge */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {lesson.is_free_preview && (
                                                            <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">
                                                                Безплатно
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {formatDuration(lesson.duration_seconds)}
                                                        </span>
                                                    </div>
                                                </a>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}
