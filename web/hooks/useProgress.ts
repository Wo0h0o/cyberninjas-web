'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserProgress } from '@/lib/types'

export function useProgress(userId: string | null) {
    const [progress, setProgress] = useState<UserProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProgress() {
            if (!userId) {
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', userId)

                if (error) throw error
                setProgress(data || [])
            } catch (err) {
                console.error('Failed to fetch progress:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [userId])

    const updateProgress = useCallback(async (
        lessonId: string,
        updates: { is_completed?: boolean; video_position_seconds?: number }
    ) => {
        if (!userId) return

        try {
            const existingProgress = progress.find(p => p.lesson_id === lessonId)

            if (existingProgress) {
                const { data, error } = await supabase
                    .from('user_progress')
                    .update({
                        ...updates,
                        completed_at: updates.is_completed ? new Date().toISOString() : existingProgress.completed_at
                    })
                    .eq('id', existingProgress.id)
                    .select()
                    .single()

                if (error) throw error

                setProgress(prev =>
                    prev.map(p => p.id === existingProgress.id ? data : p)
                )
            } else {
                const { data, error } = await supabase
                    .from('user_progress')
                    .insert({
                        user_id: userId,
                        lesson_id: lessonId,
                        is_completed: updates.is_completed || false,
                        video_position_seconds: updates.video_position_seconds || 0,
                        completed_at: updates.is_completed ? new Date().toISOString() : null
                    })
                    .select()
                    .single()

                if (error) throw error

                setProgress(prev => [...prev, data])
            }
        } catch (err) {
            console.error('Failed to update progress:', err)
        }
    }, [userId, progress])

    const getLessonProgress = useCallback((lessonId: string) => {
        return progress.find(p => p.lesson_id === lessonId) || null
    }, [progress])

    const getCourseProgress = useCallback((lessonIds: string[]) => {
        const completedCount = lessonIds.filter(id =>
            progress.some(p => p.lesson_id === id && p.is_completed)
        ).length

        return {
            completed: completedCount,
            total: lessonIds.length,
            percentage: lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0
        }
    }, [progress])

    return {
        progress,
        loading,
        updateProgress,
        getLessonProgress,
        getCourseProgress
    }
}
