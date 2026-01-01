import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Achievement {
    code: string
    name: string
    description: string
    icon: string
    tier: number
    is_secret: boolean
    xp_reward: number
    trigger_conditions: any
}

const achievements: Achievement[] = [
    // ======================
    // TIER 1: Discovery (Easy - Everyone gets)
    // ======================
    {
        code: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎓',
        tier: 1,
        is_secret: false,
        xp_reward: 50,
        trigger_conditions: {
            type: 'lesson_completion',
            count: 1
        }
    },
    {
        code: 'explorer',
        name: 'Explorer',
        description: 'View 5+ different course previews',
        icon: '🔍',
        tier: 1,
        is_secret: false,
        xp_reward: 50,
        trigger_conditions: {
            type: 'course_views',
            count: 5
        }
    },
    {
        code: 'collector',
        name: 'Collector',
        description: 'Copy 10+ prompts from library',
        icon: '📋',
        tier: 1,
        is_secret: false,
        xp_reward: 50,
        trigger_conditions: {
            type: 'prompt_copies',
            count: 10
        }
    },
    {
        code: 'shiny_hunter',
        name: 'Shiny Hunter',
        description: 'Check out all AI platforms (visit 10+)',
        icon: '🌟',
        tier: 1,
        is_secret: false,
        xp_reward: 75,
        trigger_conditions: {
            type: 'platform_visits',
            count: 10
        }
    },

    // ======================
    // TIER 2: Dedication (Medium - Consistent effort)
    // ======================
    {
        code: '3_day_streak',
        name: '3-Day Streak',
        description: 'Train 3 days in a row',
        icon: '🔥',
        tier: 2,
        is_secret: false,
        xp_reward: 100,
        trigger_conditions: {
            type: 'streak',
            days: 3
        }
    },
    {
        code: 'week_warrior',
        name: 'Week Warrior',
        description: '7-day streak',
        icon: '🔥🔥',
        tier: 2,
        is_secret: false,
        xp_reward: 200,
        trigger_conditions: {
            type: 'streak',
            days: 7
        }
    },
    {
        code: 'month_master',
        name: 'Month Master',
        description: '30-day streak',
        icon: '🔥🔥🔥',
        tier: 2,
        is_secret: false,
        xp_reward: 500,
        trigger_conditions: {
            type: 'streak',
            days: 30
        }
    },

    // ======================
    // TIER 3: Secret (Hidden until unlocked)
    // ======================
    {
        code: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 5 lessons after 11pm',
        icon: '🌙',
        tier: 3,
        is_secret: true,
        xp_reward: 150,
        trigger_conditions: {
            type: 'time_based',
            time_range: { start: '23:00', end: '06:00' },
            count: 5
        }
    },
    {
        code: 'coffee_ninja',
        name: 'Coffee Ninja',
        description: 'Train 5 mornings in a row (6am-9am)',
        icon: '☕',
        tier: 3,
        is_secret: true,
        xp_reward: 150,
        trigger_conditions: {
            type: 'time_based',
            time_range: { start: '06:00', end: '09:00' },
            consecutive_days: 5
        }
    },
    {
        code: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Single session >3 hours',
        icon: '🏔️',
        tier: 3,
        is_secret: true,
        xp_reward: 200,
        trigger_conditions: {
            type: 'session_duration',
            minutes: 180
        }
    },
    {
        code: 'generous_spirit',
        name: 'Generous Spirit',
        description: 'Share 5+ builds/prompts with community',
        icon: '🎁',
        tier: 3,
        is_secret: true,
        xp_reward: 200,
        trigger_conditions: {
            type: 'shares',
            count: 5
        }
    },
    {
        code: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete any course with 100%',
        icon: '🎯',
        tier: 3,
        is_secret: true,
        xp_reward: 300,
        trigger_conditions: {
            type: 'course_completion',
            percentage: 100
        }
    },

    // ======================
    // TIER 4: Legendary (Very Hard - Flex material)
    // ======================
    {
        code: 'ai_master',
        name: 'AI Master',
        description: 'Level 15, 5 courses 100% completed, 60-day streak',
        icon: '👑',
        tier: 4,
        is_secret: false,
        xp_reward: 1000,
        trigger_conditions: {
            type: 'combined',
            requirements: [
                { type: 'level', value: 15 },
                { type: 'course_completion', count: 5, percentage: 100 },
                { type: 'streak', days: 60 }
            ]
        }
    },
    {
        code: 'speedrunner',
        name: 'Speedrunner',
        description: 'Complete entire course in <8 hours',
        icon: '🚀',
        tier: 4,
        is_secret: false,
        xp_reward: 500,
        trigger_conditions: {
            type: 'course_speed',
            max_hours: 8
        }
    },
    {
        code: 'diamond_ninja',
        name: 'Diamond Ninja',
        description: '90-day streak + $1000+ estimated impact',
        icon: '💎',
        tier: 4,
        is_secret: false,
        xp_reward: 2000,
        trigger_conditions: {
            type: 'combined',
            requirements: [
                { type: 'streak', days: 90 },
                { type: 'impact_value', min_money: 1000 }
            ]
        }
    }
]

async function seedAchievements() {
    console.log('🎖️ Seeding achievements...')

    try {
        // Check if achievements already exist
        const { data: existing } = await supabase
            .from('achievements')
            .select('code')

        const existingCodes = new Set(existing?.map(a => a.code) || [])

        // Filter out already existing achievements
        const newAchievements = achievements.filter(a => !existingCodes.has(a.code))

        if (newAchievements.length === 0) {
            console.log('✅ All achievements already seeded')
            return
        }

        const { data, error } = await supabase
            .from('achievements')
            .insert(newAchievements)
            .select()

        if (error) {
            console.error('❌ Error seeding achievements:', error)
            throw error
        }

        console.log(`✅ Successfully seeded ${newAchievements.length} achievements`)
        console.log('\nAchievements by tier:')
        console.log(`Tier 1 (Discovery): ${newAchievements.filter(a => a.tier === 1).length}`)
        console.log(`Tier 2 (Dedication): ${newAchievements.filter(a => a.tier === 2).length}`)
        console.log(`Tier 3 (Secret): ${newAchievements.filter(a => a.tier === 3).length}`)
        console.log(`Tier 4 (Legendary): ${newAchievements.filter(a => a.tier === 4).length}`)
    } catch (error) {
        console.error('❌ Failed to seed achievements:', error)
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    seedAchievements().then(() => {
        console.log('\n🎉 Achievements seeding complete!')
        process.exit(0)
    })
}

export { seedAchievements }
