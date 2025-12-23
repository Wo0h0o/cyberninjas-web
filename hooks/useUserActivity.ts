import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UserStats {
    user_id: string

    // Courses
    lessons_watched: number
    courses_completed: number
    total_watch_time_seconds: number

    // Prompts
    prompts_copied: number
    prompts_favorited: number
    prompts_viewed: number

    // Guides
    guides_viewed: number
    guides_completed: number

    // Resources
    resources_downloaded: number
    resources_viewed: number

    // Meta
    last_active_feature: 'courses' | 'prompts' | 'guides' | 'resources'
    last_active_at: string
    total_activity_count: number

    created_at: string
    updated_at: string
}

export function useUserActivity() {
    const { user } = useAuth()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            setStats(null)
            return
        }

        async function fetchStats() {
            try {
                console.log('[useUserActivity] Fetching stats for user:', user.id)

                const { data, error: fetchError } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle() // Use maybeSingle to handle no rows gracefully

                if (fetchError) {
                    console.error('[useUserActivity] Error fetching stats:', fetchError)
                    // Treat as first-time user
                    setStats(null)
                    setLoading(false)
                    return
                }

                // If no data, user is first-time (no stats yet)
                if (!data) {
                    console.log('[useUserActivity] No stats found - treating as first-time user')
                    setStats(null)
                } else {
                    console.log('[useUserActivity] Stats loaded:', data)
                    setStats(data)
                }
            } catch (err) {
                console.error('[useUserActivity] Unexpected error:', err)
                setError(err as Error)
                setStats(null)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        // Set up real-time subscription for stats updates
        const channel = supabase
            .channel('user_stats_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_stats',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('[useUserActivity] Real-time update:', payload)
                    if (payload.new) {
                        setStats(payload.new as UserStats)
                    }
                }
            )
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [user])

    /**
     * Check if user is truly first-time (no activity at all)
     */
    const isFirstTime = !loading && (!stats || stats.total_activity_count === 0)

    console.log('[useUserActivity] Current state:', { loading, stats: !!stats, isFirstTime, total_activity: stats?.total_activity_count })

    /**
     * Get formatted time watched
     */
    const formatTimeWatched = (): string => {
        if (!stats) return '0м'
        const seconds = stats.total_watch_time_seconds
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) return `${hours}.${Math.floor(minutes / 6)}h`
        return `${minutes}м`
    }

    /**
     * Get primary feature (most used)
     */
    const getPrimaryFeature = (): 'courses' | 'prompts' | 'guides' | 'resources' => {
        if (!stats) return 'courses'

        const featureCounts = {
            courses: stats.lessons_watched,
            prompts: stats.prompts_copied + stats.prompts_favorited,
            guides: stats.guides_viewed,
            resources: stats.resources_downloaded
        }

        return Object.entries(featureCounts).reduce((a, b) =>
            featureCounts[a[0] as keyof typeof featureCounts] > featureCounts[b[0] as keyof typeof featureCounts] ? a : b
        )[0] as 'courses' | 'prompts' | 'guides' | 'resources'
    }

    return {
        stats,
        loading,
        error,
        isFirstTime,
        formatTimeWatched,
        getPrimaryFeature
    }
}
