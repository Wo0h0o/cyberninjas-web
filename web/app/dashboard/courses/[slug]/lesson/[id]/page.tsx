'use client'

import { use, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLesson } from '@/hooks/useCourses'
import { VideoPlayer, LessonList } from '@/components/dashboard'

interface LessonPageProps {
    params: Promise<{ slug: string; id: string }>
}

export default function LessonPage({ params }: LessonPageProps) {
    const resolvedParams = use(params)
    const { lesson: lessonData, loading, error } = useLesson(resolvedParams.id)

    // Calculate prev/next lessons
    const { prevLesson, nextLesson } = useMemo(() => {
        if (!lessonData) return { prevLesson: null, nextLesson: null }

        const allLessons = lessonData.allLessons
        const currentIndex = allLessons.findIndex((l: { id: string }) => l.id === resolvedParams.id)

        return {
            prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
        }
    }, [lessonData, resolvedParams.id])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="aspect-video rounded-2xl bg-white/[0.03] animate-pulse" />
                <div className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            </div>
        )
    }

    if (error || !lessonData) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">Урокът не е намерен</h2>
                <p className="text-gray-400 mb-6">{error || 'Този урок не съществува.'}</p>
                <Link href="/dashboard/courses" className="text-accent-yellow hover:text-accent-yellow-hover">
                    ← Обратно към курсовете
                </Link>
            </div>
        )
    }

    const { lesson, course, module } = lessonData

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
                {/* Return to Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Обратно към началото
                    </Link>
                </motion.div>

                {/* Breadcrumb */}
                <motion.nav
                    className="flex items-center gap-2 text-sm flex-wrap"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link href="/dashboard/courses" className="text-gray-500 hover:text-white transition-colors">
                        Академия
                    </Link>
                    <span className="text-gray-600">/</span>
                    <Link
                        href={`/dashboard/courses/${course.slug}`}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        {course.title}
                    </Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-white">{lesson.title}</span>
                </motion.nav>

                {/* Video Player */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <VideoPlayer url={lesson.video_url} title={lesson.title} />
                </motion.div>

                {/* Lesson Info */}
                <motion.div
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <p className="text-sm text-accent-yellow mb-1">{module.title}</p>
                            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Отбележи като завършен
                        </button>
                    </div>

                    {lesson.description && (
                        <p className="text-gray-400 mb-6">{lesson.description}</p>
                    )}

                    {/* Lesson Content */}
                    {lesson.content_html && (
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                        />
                    )}
                </motion.div>

                {/* Lesson Navigation - More Prominent */}
                <motion.div
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 sticky top-0 z-10 backdrop-blur-md bg-black/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {prevLesson ? (
                        <Link
                            href={`/dashboard/courses/${course.slug}/lesson/${prevLesson.id}`}
                            className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/[0.05] border border-white/10 hover:border-accent-yellow/50 hover:bg-accent-yellow/10 transition-all group flex-1 max-w-[45%]"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-accent-yellow transition-colors flex-shrink-0">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <div className="text-left overflow-hidden">
                                <p className="text-xs text-gray-500 mb-1">Предишен урок</p>
                                <p className="text-sm text-white font-medium truncate">{prevLesson.title}</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {nextLesson ? (
                        <Link
                            href={`/dashboard/courses/${course.slug}/lesson/${nextLesson.id}`}
                            className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-accent-yellow/20 to-accent-yellow-hover/20 border border-accent-yellow/50 hover:border-accent-yellow hover:from-accent-yellow/30 hover:to-accent-yellow-hover/30 transition-all group flex-1 max-w-[45%]"
                        >
                            <div className="text-right overflow-hidden flex-1">
                                <p className="text-xs text-accent-yellow mb-1">Следващ урок</p>
                                <p className="text-sm text-white font-semibold truncate">{nextLesson.title}</p>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-yellow group-hover:text-accent-yellow-hover transition-colors group-hover:translate-x-1 flex-shrink-0">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href={`/dashboard/courses/${course.slug}`}
                            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all text-green-400 font-semibold flex-1"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            <span>Завърши курса и виж прогреса</span>
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Sidebar - Lesson List */}
            <motion.aside
                className="xl:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="sticky top-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Съдържание</h3>
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                        <LessonList
                            modules={[{
                                ...module,
                                lessons: lessonData.allLessons.filter((l: { id: string }) =>
                                    lessonData.allLessons
                                        .slice(0, lessonData.allLessons.findIndex((all: { id: string }) => all.id === lessonData.lesson.id) + 5)
                                        .some((visible: { id: string }) => visible.id === l.id)
                                )
                            }]}
                            currentLessonId={resolvedParams.id}
                            courseSlug={course.slug}
                        />
                    </div>
                </div>
            </motion.aside>
        </div>
    )
}
