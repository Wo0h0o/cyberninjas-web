'use client'

import { HeroActionCard, ProgressOverview } from '@/components/dashboard'
import { useUserActivity } from '@/hooks/useUserActivity'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
    const { profile } = useAuth()
    const { stats, loading, formatTimeWatched } = useUserActivity()

    // Check if user has course activity (lessons watched)
    const hasCourseActivity = stats && stats.lessons_watched > 0

    // IMPORTANT: Show 4-choice screen if NO course activity
    // Even if user has prompts/guides activity, show choices until they start a course
    const heroVariant = hasCourseActivity ? 'returning' : 'first-time-choice'

    // Calculate simple streak
    const streak = stats ? Math.floor(stats.total_activity_count / 5) : 0

    // Only show current lesson if has REAL course activity
    // TODO: Replace with real useUserProgress to get actual last lesson
    const currentLesson = hasCourseActivity ? {
        title: 'Последно гледан урок',
        courseTitle: 'AI Основи',
        courseSlug: 'ai-basics',
        lessonSlug: 'intro',
        duration: 15,
        progress: 45
    } : undefined

    const overallProgress = stats ?
        Math.round((stats.lessons_watched + stats.prompts_copied + stats.guides_viewed) / 3) : 0

    return (
        <div className="space-y-6">
            {/* HERO ZONE - Primary Action */}
            <HeroActionCard
                variant={heroVariant}
                user={{
                    name: profile?.name || undefined,
                    hasStartedCourse: hasCourseActivity || undefined
                }}
                currentLesson={currentLesson}
                overallProgress={overallProgress}
                stats={{
                    completedLessons: stats?.lessons_watched || 0,
                    totalLessons: 24, // Mock total
                    streak: streak
                }}
            />
        </div>
    )
}
