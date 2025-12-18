import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUserLevel } from './useUserLevel'

export interface Achievement {
    id: string
    code: string
    name: string
    description: string
    icon: string
    tier: number
    is_secret: boolean
    xp_reward: number
    trigger_conditions: any
}

export interface UserAchievement {
    id: string
    achievement_id: string
    unlocked_at: string
    achievement: Achievement
}

export function useAchievements() {
    const { user } = useAuth()
    const { addXP } = useUserLevel()
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
    const [loading, setLoading] = useState(true)
    const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null)

    useEffect(() => {
        if (user) {
            fetchAchievements()
            fetchUserAchievements()

            // Subscribe to new achievements
            const subscription = supabase
                .channel('user_achievements_changes')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_achievements',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    console.log('New achievement unlocked!', payload)
                    fetchUserAchievements()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        } else {
            setLoading(false)
        }
    }, [user])

    async function fetchAchievements() {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .order('tier', { ascending: true })

            if (error) throw error
            setAchievements(data || [])
        } catch (error) {
            console.error('Error fetching achievements:', error)
        }
    }

    async function fetchUserAchievements() {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('user_achievements')
                .select(`
          id,
          achievement_id,
          unlocked_at,
          achievement:achievements(*)
        `)
                .eq('user_id', user?.id)
                .order('unlocked_at', { ascending: false })

            if (error) throw error
            setUserAchievements(data as any || [])
        } catch (error) {
            console.error('Error fetching user achievements:', error)
        } finally {
            setLoading(false)
        }
    }

    async function unlockAchievement(achievementCode: string) {
        if (!user) return false

        try {
            // Find achievement
            const achievement = achievements.find(a => a.code === achievementCode)
            if (!achievement) {
                console.error(`Achievement ${achievementCode} not found`)
                return false
            }

            // Check if already unlocked
            const alreadyUnlocked = userAchievements.some(
                ua => ua.achievement.code === achievementCode
            )

            if (alreadyUnlocked) {
                console.log(`Achievement ${achievementCode} already unlocked`)
                return false
            }

            // Unlock achievement
            const { data, error } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: user.id,
                    achievement_id: achievement.id
                })
                .select()
                .single()

            if (error) throw error

            // Award XP
            if (achievement.xp_reward > 0) {
                await addXP(achievement.xp_reward, `Achievement: ${achievement.name}`)
            }

            // Set as recently unlocked (for toast notification)
            setRecentlyUnlocked(achievement)

            // Auto-clear after 5 seconds
            setTimeout(() => setRecentlyUnlocked(null), 5000)

            console.log(`🎉 Achievement unlocked: ${achievement.name} (+${achievement.xp_reward} XP)`)

            return true
        } catch (error) {
            console.error('Error unlocking achievement:', error)
            return false
        }
    }

    // Check if user meets conditions for specific achievements
    async function checkAchievement(code: string, userStats: any) {
        const achievement = achievements.find(a => a.code === code)
        if (!achievement) return false

        const conditions = achievement.trigger_conditions

        switch (conditions.type) {
            case 'lesson_completion':
                return userStats.completedLessons >= conditions.count

            case 'course_views':
                return userStats.courseViews >= conditions.count

            case 'prompt_copies':
                return userStats.promptCopies >= conditions.count

            case 'platform_visits':
                return userStats.platformVisits >= conditions.count

            case 'streak':
                return userStats.streakDays >= conditions.days

            case 'course_completion':
                if (conditions.percentage === 100) {
                    return userStats.completedCourses >= 1
                }
                return false

            case 'shares':
                return userStats.shares >= conditions.count

            case 'combined':
                // Complex conditions - check all requirements
                return conditions.requirements.every((req: any) => {
                    return checkCondition(req, userStats)
                })

            default:
                return false
        }
    }

    function checkCondition(condition: any, userStats: any): boolean {
        switch (condition.type) {
            case 'level':
                return userStats.level >= condition.value

            case 'course_completion':
                return userStats.coursesCompleted100Percent >= condition.count

            case 'streak':
                return userStats.streakDays >= condition.days

            case 'impact_value':
                return userStats.moneySaved >= condition.min_money

            default:
                return false
        }
    }

    // Auto-check all achievements based on user stats
    async function autoCheckAchievements(userStats: any) {
        if (!user) return

        for (const achievement of achievements) {
            // Skip if already unlocked
            const alreadyUnlocked = userAchievements.some(
                ua => ua.achievement.code === achievement.code
            )
            if (alreadyUnlocked) continue

            // Check conditions
            const meetsConditions = await checkAchievement(achievement.code, userStats)

            if (meetsConditions) {
                await unlockAchievement(achievement.code)
            }
        }
    }

    function isUnlocked(achievementCode: string): boolean {
        return userAchievements.some(ua => ua.achievement.code === achievementCode)
    }

    function getUnlockedCount(): number {
        return userAchievements.length
    }

    function getTotalCount(): number {
        return achievements.length
    }

    function getProgressPercentage(): number {
        if (achievements.length === 0) return 0
        return Math.round((userAchievements.length / achievements.length) * 100)
    }

    // Get achievements by tier
    function getAchievementsByTier(tier: number): Achievement[] {
        return achievements.filter(a => a.tier === tier)
    }

    // Get unlocked achievements by tier
    function getUnlockedByTier(tier: number): UserAchievement[] {
        return userAchievements.filter(ua => ua.achievement.tier === tier)
    }

    return {
        achievements,
        userAchievements,
        loading,
        recentlyUnlocked,
        unlockAchievement,
        checkAchievement,
        autoCheckAchievements,
        isUnlocked,
        getUnlockedCount,
        getTotalCount,
        getProgressPercentage,
        getAchievementsByTier,
        getUnlockedByTier,
        refreshAchievements: fetchUserAchievements
    }
}
