'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Course, CourseWithModules, ModuleWithLessons } from '@/lib/types'

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCourses() {
            try {
                console.log('useCourses: Fetching courses...')
                const { data, error } = await supabase
                    .from('courses')
                    .select(`
                        *,
                        modules:modules(id),
                        purchases:purchases(id),
                        ratings:course_ratings(rating)
                    `)
                    .eq('is_published', true)
                    .order('order_index', { ascending: true })

                console.log('useCourses: Result:', { data, error })
                if (error) throw error

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
                setError(err instanceof Error ? err.message : 'Failed to fetch courses')
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [])

    return { courses, loading, error }
}

export function useCourse(slug: string) {
    const [course, setCourse] = useState<CourseWithModules | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCourse() {
            try {
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
                setError(err instanceof Error ? err.message : 'Failed to fetch course')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchCourse()
        }
    }, [slug])

    return { course, loading, error }
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

    useEffect(() => {
        async function fetchLesson() {
            try {
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
                setError(err instanceof Error ? err.message : 'Failed to fetch lesson')
            } finally {
                setLoading(false)
            }
        }

        if (lessonId) {
            fetchLesson()
        }
    }, [lessonId])

    return { lesson, loading, error }
}
