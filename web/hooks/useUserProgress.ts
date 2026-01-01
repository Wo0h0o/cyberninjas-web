import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUserLevel } from './useUserLevel'
import { useAchievements } from './useAchievements'

export interface LessonProgress {
    lesson_id: string
    is_completed: boolean
    video_position_seconds: number
    last_accessed_at: string | null
    completed_at: string | null
}

export interface CourseProgress {
    course_id: string
    course_title: string
    course_slug: string
    total_lessons: number
    completed_lessons: number
    last_lesson_id: string | null
    last_lesson_title: string | null
    last_module_title: string | null
    last_accessed_at: string | null
    progress_percentage: number
}

export function useUserProgress() {
    const { user } = useAuth()
    const { addXP } = useUserLevel()
    const { autoCheckAchievements } = useAchievements()
    const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCompletedLessons, setTotalCompletedLessons] = useState(0)
    const [totalTimeWatched, setTotalTimeWatched] = useState(0)

    useEffect(() => {
        if (user) {
            fetchUserProgress()
        } else {
            setLoading(false)
        }
    }, [user])

    async function fetchUserProgress() {
        try {
            setLoading(true)

            // Get all user's progress
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select(`
                    *,
                    lessons (
                        id,
                        title,
                        duration_seconds,
                        module_id,
                        modules (
                            title,
                            course_id,
                            courses (
                                id,
                                title,
                                slug
                            )
                        )
                    )
                `)
                .eq('user_id', user?.id || '')

            if (progressError) throw progressError

            // Calculate totals
            const completedCount = (progressData as any[])?.filter((p: any) => p.is_completed).length || 0
            const totalTime = (progressData as any[])?.reduce((acc: number, p: any) => acc + (p.video_position_seconds || 0), 0) || 0

            setTotalCompletedLessons(completedCount)
            setTotalTimeWatched(Math.floor(totalTime / 3600)) // Convert to hours

            // Group by course
            const coursesMap = new Map<string, CourseProgress>()

            for (const progress of (progressData as any[]) || []) {
                const lesson = progress.lessons as any
                if (!lesson?.modules?.courses) continue

                const course = lesson.modules.courses
                const courseId = course.id

                if (!coursesMap.has(courseId)) {
                    // Get total lessons for this course
                    const { count } = await supabase
                        .from('lessons')
                        .select('*', { count: 'exact', head: true })
                        .eq('modules.course_id', courseId)

                    coursesMap.set(courseId, {
                        course_id: courseId,
                        course_title: course.title,
                        course_slug: course.slug,
                        total_lessons: count || 0,
                        completed_lessons: 0,
                        last_lesson_id: null,
                        last_lesson_title: null,
                        last_module_title: null,
                        last_accessed_at: null,
                        progress_percentage: 0,
                    })
                }

                const courseProgress = coursesMap.get(courseId)!

                // Count completed
                if ((progress as any).is_completed) {
                    courseProgress.completed_lessons++
                }

                // Track last accessed
                if ((progress as any).last_accessed_at &&
                    (!courseProgress.last_accessed_at ||
                        new Date((progress as any).last_accessed_at) > new Date(courseProgress.last_accessed_at))) {
                    courseProgress.last_accessed_at = (progress as any).last_accessed_at
                    courseProgress.last_lesson_id = lesson.id
                    courseProgress.last_lesson_title = lesson.title
                    courseProgress.last_module_title = lesson.modules.title
                }
            }

            // Calculate percentages
            const progressArray = Array.from(coursesMap.values()).map(cp => ({
                ...cp,
                progress_percentage: cp.total_lessons > 0
                    ? Math.round((cp.completed_lessons / cp.total_lessons) * 100)
                    : 0,
            }))

            // Sort by last accessed (most recent first)
            progressArray.sort((a, b) => {
                if (!a.last_accessed_at) return 1
                if (!b.last_accessed_at) return -1
                return new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
            })

            setCourseProgress(progressArray)
        } catch (error) {
            console.error('Error fetching user progress:', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateLessonProgress(
        lessonId: string,
        updates: Partial<LessonProgress>
    ) {
        if (!user) return

        try {
            // Check if lesson was already completed
            const { data: existing } = await supabase
                .from('user_progress')
                .select('is_completed, lessons(title, modules(title, course_id, courses(title)))')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .single()

            const wasAlreadyCompleted = existing?.is_completed || false
            const lessonData = (existing as any)?.lessons
            const courseId = lessonData?.modules?.course_id

            // Update progress
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    ...updates,
                    last_accessed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as any)

            if (error) throw error

            // Award XP if newly completed
            if (updates.is_completed && !wasAlreadyCompleted) {
                // +25 XP for lesson completion
                await addXP(25, `Completed lesson: ${lessonData?.title || 'Unknown'}`)

                // Check if course is now 100% complete
                if (courseId) {
                    const { data: courseProgressData } = await supabase
                        .from('user_progress')
                        .select('is_completed, lessons!inner(modules!inner(course_id))')
                        .eq('user_id', user.id)
                        .eq('lessons.modules.course_id', courseId)

                    const totalLessons = courseProgressData?.length || 0
                    const completedLessonsInCourse = courseProgressData?.filter((p: any) => p.is_completed).length || 0

                    // If course just reached 100%
                    if (totalLessons > 0 && completedLessonsInCourse === totalLessons) {
                        // +100 XP bonus for course completion
                        await addXP(100, `Course mastered: ${lessonData?.modules?.courses?.title || 'Unknown'}`)
                    }
                }

                // Trigger achievement checks
                await autoCheckAchievements({
                    completedLessons: totalCompletedLessons + 1,
                    courseViews: courseProgress.length,
                })
            }

            // Refresh progress
            await fetchUserProgress()
        } catch (error) {
            console.error('Error updating progress:', error)
        }
    }

    return {
        courseProgress,
        totalCompletedLessons,
        totalTimeWatched,
        loading,
        updateLessonProgress,
        refreshProgress: fetchUserProgress,
    }
}
