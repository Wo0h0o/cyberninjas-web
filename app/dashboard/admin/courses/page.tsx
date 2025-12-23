'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BookOpen, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    price_bgn: number
    order_index: number
    is_published: boolean
    difficulty: 'beginner' | 'intermediate' | 'advanced' | null
    created_at: string
    module_count?: number
    lesson_count?: number
}

export default function CoursesAdminPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCourses()
    }, [])

    async function fetchCourses() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Fetch module and lesson counts for each course
            const coursesWithCounts = await Promise.all(
                (data || []).map(async (course) => {
                    const { count: moduleCount } = await supabase
                        .from('modules')
                        .select('*', { count: 'exact', head: true })
                        .eq('course_id', course.id)

                    const { count: lessonCount } = await supabase
                        .from('lessons')
                        .select('*, modules!inner(course_id)', { count: 'exact', head: true })
                        .eq('modules.course_id', course.id)

                    return {
                        ...course,
                        module_count: moduleCount || 0,
                        lesson_count: lessonCount || 0,
                    }
                })
            )

            setCourses(coursesWithCounts)
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    async function togglePublish(courseId: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ is_published: !currentStatus })
                .eq('id', courseId)

            if (error) throw error

            // Update local state
            setCourses(courses.map(c =>
                c.id === courseId ? { ...c, is_published: !currentStatus } : c
            ))
        } catch (error) {
            console.error('Error toggling publish:', error)
            alert('Грешка при промяна на статуса')
        }
    }

    async function deleteCourse(courseId: string, title: string) {
        if (!confirm(`Сигурен ли си, че искаш да изтриеш "${title}"? Това ще изтрие и всички модули и лекции!`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId)

            if (error) throw error

            setCourses(courses.filter(c => c.id !== courseId))
        } catch (error) {
            console.error('Error deleting course:', error)
            alert('Грешка при изтриване на курса')
        }
    }

    const filteredCourses = courses.filter(course => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'published' && course.is_published) ||
            (filter === 'draft' && !course.is_published)

        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesFilter && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Академия</h1>
                    <p className="text-gray-400">Управление на курсове, модули и лекции</p>
                </div>
                <Link
                    href="/dashboard/admin/courses/new"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Създай курс
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`
                                px-4 py-2 rounded-lg transition-colors
                                ${filter === status
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }
                            `}
                        >
                            {status === 'all' && 'Всички'}
                            {status === 'published' && 'Публикувани'}
                            {status === 'draft' && 'Чернови'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Търси по заглавие или описание..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                    />
                </div>
            </div>

            {/* Courses Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Курс</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Статус</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Ниво</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Структура</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Цена</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-white">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                            Зареждане...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12">
                                        <div className="text-center">
                                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400 mb-1">Няма намерени курсове</p>
                                            <p className="text-sm text-gray-500">
                                                {filter !== 'all' || searchQuery
                                                    ? 'Пробвай друг филтър или търсене'
                                                    : 'Създай своя първи курс!'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course, index) => (
                                    <motion.tr
                                        key={course.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                                                    {course.thumbnail_url ? (
                                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{course.title}</div>
                                                    {course.description && (
                                                        <div className="text-sm text-gray-400 truncate max-w-md">
                                                            {course.description.substring(0, 60)}...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                                    ${course.is_published
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }
                                                `}
                                            >
                                                {course.is_published ? (
                                                    <>
                                                        <Eye className="w-3 h-3" />
                                                        Публикуван
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3 h-3" />
                                                        Чернова
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.difficulty && (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.difficulty === 'beginner'
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : course.difficulty === 'intermediate'
                                                            ? 'bg-blue-500/20 text-blue-300'
                                                            : 'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {course.difficulty === 'beginner' ? 'Начинаещи' : course.difficulty === 'intermediate' ? 'Средно' : 'Напреднали'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-400">
                                                {course.module_count} {course.module_count === 1 ? 'модул' : 'модула'} •{' '}
                                                {course.lesson_count} {course.lesson_count === 1 ? 'лекция' : 'лекции'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{course.price_bgn} лв.</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/courses/${course.id}`}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="Редактирай"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => togglePublish(course.id, course.is_published)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title={course.is_published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {course.is_published ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteCourse(course.id, course.title)}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Изтрий"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            {!loading && filteredCourses.length > 0 && (
                <div className="text-sm text-gray-400 text-center">
                    Показани {filteredCourses.length} от {courses.length} курса
                </div>
            )}
        </div>
    )
}
