'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast, FRIENDLY_MESSAGES } from '@/contexts/ToastContext'
import type { Course, CourseWithModules, ModuleWithLessons } from '@/lib/types'

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const toast = useToast()

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: supabaseError } = await supabase
                .from('courses')
                .select(`
                    *,
                    modules:modules(id),
                    purchases:purchases(id),
                    ratings:course_ratings(rating)
                `)
                .eq('is_published', true)
                .order('order_index', { ascending: true })

            if (supabaseError) throw supabaseError

            // Transform data to include computed counts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const coursesWithCounts = ((data || []) as any[]).map(course => ({
                ...course,
                modules_count: course.modules?.length || 0,
                students_count: course.purchases?.length || 0,
                modules: undefined,
                purchases: undefined
            })) as Course[]

            setCourses(coursesWithCounts)
        } catch (err) {
            console.error('useCourses: Error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses'
            setError(errorMessage)

            // Show friendly toast notification
            toast.error(
                FRIENDLY_MESSAGES.server.title,
                'Курсовете не можаха да се заредят.',
                { label: 'Опитай пак', onClick: () => fetchCourses() }
            )
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    return { courses, loading, error, refetch: fetchCourses }
}

export function useCourse(slug: string) {
    const [course, setCourse] = useState<CourseWithModules | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const toast = useToast()

    const fetchCourse = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('slug', slug)
                .eq('is_published', true)
                .single()

            if (courseError) throw courseError

            // Fetch modules with lessons
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select(`
            *,
            lessons (*)
          `)
                .eq('course_id', courseData.id)
                .order('order_index', { ascending: true })

            if (modulesError) throw modulesError

            // Sort lessons within each module
            const modulesWithSortedLessons: ModuleWithLessons[] = (modulesData || []).map(module => ({
                ...module,
                lessons: (module.lessons || []).sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
            }))

            setCourse({
                ...courseData,
                modules: modulesWithSortedLessons
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course'
            setError(errorMessage)

            // Show friendly toast
            toast.error(
                'Курсът не се зареди',
                'Опитай да презаредиш страницата.',
                { label: 'Опитай пак', onClick: () => fetchCourse() }
            )
        } finally {
            setLoading(false)
        }
    }, [slug, toast])

    useEffect(() => {
        if (slug) {
            fetchCourse()
        }
    }, [slug, fetchCourse])

    return { course, loading, error, refetch: fetchCourse }
}

export function useLesson(lessonId: string) {
    const [lesson, setLesson] = useState<{
        lesson: import('@/lib/types').Lesson
        course: Course
        module: import('@/lib/types').Module
        allLessons: import('@/lib/types').Lesson[]
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const toast = useToast()

    const fetchLesson = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch lesson with module
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .select(`
            *,
            module:modules (
              *,
              course:courses (*)
            )
          `)
                .eq('id', lessonId)
                .single()

            if (lessonError) throw lessonError

            const module = lessonData.module as unknown as import('@/lib/types').Module & { course: Course }
            const course = module.course

            // Fetch all lessons in this course for navigation
            const { data: allModules, error: allModulesError } = await supabase
                .from('modules')
                .select(`
            *,
            lessons (*)
          `)
                .eq('course_id', course.id)
                .order('order_index', { ascending: true })

            if (allModulesError) throw allModulesError

            const allLessons = (allModules || [])
                .flatMap(m => (m.lessons || []).sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index))

            setLesson({
                lesson: lessonData,
                course,
                module,
                allLessons
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lesson'
            setError(errorMessage)

            // Show friendly toast
            toast.error(
                'Урокът не се зареди',
                'Опитай да презаредиш страницата.',
                { label: 'Опитай пак', onClick: () => fetchLesson() }
            )
        } finally {
            setLoading(false)
        }
    }, [lessonId, toast])

    useEffect(() => {
        if (lessonId) {
            fetchLesson()
        }
    }, [lessonId, fetchLesson])

    return { lesson, loading, error, refetch: fetchLesson }
}
