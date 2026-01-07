import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UserLevel {
    level: number
    xp: number
    title: string
    streak_days: number
    last_activity_date: string
    xp_to_next_level: number
    progress_percentage: number
}

const LEVEL_XP_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    850,    // Level 5
    1300,   // Level 6
    1850,   // Level 7
    2500,   // Level 8
    3300,   // Level 9
    4250,   // Level 10
    5400,   // Level 11
    6750,   // Level 12
    8300,   // Level 13
    10100,  // Level 14
    12200,  // Level 15
    14600,  // Level 16
    17300,  // Level 17
    20400,  // Level 18
    24000,  // Level 19
    28200   // Level 20 (Max)
]

const LEVEL_TITLES = [
    'Novice',           // Level 1-2
    'Apprentice',       // Level 3-5
    'Practitioner',     // Level 6-8
    'Engineer',         // Level 9-11
    'Architect',        // Level 12-14
    'Master',           // Level 15-17
    'Grand Master',     // Level 18-19
    'Legend'            // Level 20
]

function getLevelTitle(level: number): string {
    if (level <= 2) return LEVEL_TITLES[0]
    if (level <= 5) return LEVEL_TITLES[1]
    if (level <= 8) return LEVEL_TITLES[2]
    if (level <= 11) return LEVEL_TITLES[3]
    if (level <= 14) return LEVEL_TITLES[4]
    if (level <= 17) return LEVEL_TITLES[5]
    if (level <= 19) return LEVEL_TITLES[6]
    return LEVEL_TITLES[7]
}

function calculateLevel(xp: number): { level: number; xp_to_next: number; progress: number } {
    let level = 1

    for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_XP_THRESHOLDS[i]) {
            level = i + 1
            break
        }
    }

    // Cap at level 20
    if (level >= 20) {
        return { level: 20, xp_to_next: 0, progress: 100 }
    }

    const currentLevelXP = LEVEL_XP_THRESHOLDS[level - 1]
    const nextLevelXP = LEVEL_XP_THRESHOLDS[level]
    const xpInCurrentLevel = xp - currentLevelXP
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP
    const progress = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)

    return {
        level,
        xp_to_next: nextLevelXP - xp,
        progress
    }
}

export function useUserLevel() {
    const { user } = useAuth()
    const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchUserLevel()

            // Set up realtime subscription
            const subscription = supabase
                .channel('user_level_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'user_levels',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    fetchUserLevel()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        } else {
            setLoading(false)
        }
    }, [user])

    async function fetchUserLevel() {
        try {
            setLoading(true)

            // Get or create user level
            let { data, error } = await supabase
                .from('user_levels')
                .select('*')
                .eq('user_id', user?.id)
                .single()

            if (error && error.code === 'PGRST116') {
                // User level doesn't exist, create it
                const { data: newLevel, error: insertError } = await supabase
                    .from('user_levels')
                    .insert({
                        user_id: user?.id,
                        level: 1,
                        xp: 0,
                        title: 'Novice',
                        streak_days: 0,
                        last_activity_date: new Date().toISOString().split('T')[0]
                    })
                    .select()
                    .single()

                if (insertError) throw insertError
                data = newLevel
            } else if (error) {
                throw error
            }

            if (data) {
                const { level, xp_to_next, progress } = calculateLevel(data.xp)
                const title = getLevelTitle(level)

                setUserLevel({
                    level,
                    xp: data.xp,
                    title,
                    streak_days: data.streak_days,
                    last_activity_date: data.last_activity_date,
                    xp_to_next_level: xp_to_next,
                    progress_percentage: progress
                })
            }
        } catch (error) {
            console.error('Error fetching user level:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addXP(amount: number, reason?: string) {
        if (!user) return

        try {
            const currentXP = userLevel?.xp || 0
            const newXP = currentXP + amount
            const { level: oldLevel } = calculateLevel(currentXP)
            const { level: newLevel } = calculateLevel(newXP)

            const { error } = await supabase
                .from('user_levels')
                .update({
                    xp: newXP,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)

            if (error) throw error

            // Check for level up
            if (newLevel > oldLevel) {
                console.log(`🎉 Level up! ${oldLevel} → ${newLevel}`)
            }

            // Refresh data
            await fetchUserLevel()
        } catch (error) {
            console.error('Error adding XP:', error)
        }
    }

    async function updateStreak() {
        if (!user || !userLevel) return

        try {
            const today = new Date().toISOString().split('T')[0]
            const lastActivity = userLevel.last_activity_date

            let newStreak = userLevel.streak_days

            if (lastActivity !== today) {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = yesterday.toISOString().split('T')[0]

                if (lastActivity === yesterdayStr) {
                    // Consecutive day - increment streak
                    newStreak += 1
                } else {
                    // Broke streak - reset to 1
                    newStreak = 1
                }

                const { error } = await supabase
                    .from('user_levels')
                    .update({
                        streak_days: newStreak,
                        last_activity_date: today,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)

                if (error) throw error

                await fetchUserLevel()
            }
        } catch (error) {
            console.error('Error updating streak:', error)
        }
    }

    return {
        userLevel,
        loading,
        addXP,
        updateStreak,
        refreshLevel: fetchUserLevel
    }
}
