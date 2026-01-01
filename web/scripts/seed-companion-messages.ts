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

interface CompanionMessage {
    code: string
    trigger_type: string
    message_template: string
    avatar_emotion: string
    action_buttons: any
    trigger_conditions: any
    frequency_rules: any
    is_active: boolean
}

const companionMessages: CompanionMessage[] = [
    // ======================
    // WELCOME BACK MESSAGES (5 variants)
    // ======================
    {
        code: 'welcome_1',
        trigger_type: 'welcome',
        message_template: 'Здравей {{user.name}}! 👋\n\nГотов ли си да продължиш приключението?',
        avatar_emotion: 'happy',
        action_buttons: [
            { label: 'Continue Last Mission', action: 'continue_mission' },
            { label: 'Explore New', action: 'explore' }
        ],
        trigger_conditions: { type: 'login' },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    },
    {
        code: 'welcome_2',
        trigger_type: 'welcome',
        message_template: 'Добре дошъл обратно, {{user.name}}! 🥷\n\nИмам нещо интересно за теб...',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'Show Me', action: 'show_surprise' },
            { label: 'Later', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'login' },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    },
    {
        code: 'welcome_3',
        trigger_type: 'welcome',
        message_template: 'Пропуснах те! 😊\n\nКакво ще тренираме днес?',
        avatar_emotion: 'happy',
        action_buttons: [
            { label: 'Resume Training', action: 'continue_mission' },
            { label: 'Browse Courses', action: 'browse' }
        ],
        trigger_conditions: { type: 'login' },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    },
    {
        code: 'welcome_4',
        trigger_type: 'welcome',
        message_template: 'Ха! Точно навреме. 🎯\n\nИмам нов challenge за теб...',
        avatar_emotion: 'mysterious',
        action_buttons: [
            { label: 'Accept Challenge', action: 'show_challenge' },
            { label: 'Maybe Later', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'login' },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    },
    {
        code: 'welcome_5',
        trigger_type: 'welcome',
        message_template: 'Welcome back, ninja! 💪\n\nReady да се качим на следващото level?',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: "Let's Go!", action: 'continue_mission' },
            { label: 'Check Progress', action: 'view_stats' }
        ],
        trigger_conditions: { type: 'login' },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    },

    // ======================
    // STREAK CELEBRATIONS
    // ======================
    {
        code: 'streak_3_days',
        trigger_type: 'streak',
        message_template: '🔥 WOW! {{streak_days}} дни подред!\n\nТова е в топ 30% от всички ninjas.\n\nПродължавай така! 💪',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'View Stats', action: 'view_stats' },
            { label: 'Thanks!', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'streak', days: 3 },
        frequency_rules: { max_per_day: 1, cooldown_hours: 168 },
        is_active: true
    },
    {
        code: 'streak_7_days',
        trigger_type: 'streak',
        message_template: '🔥🔥 НЕВЕРОЯТНО! {{streak_days}} дни подред!\n\nТи си в топ 15% от всички ninjas.\n\nЕто ти награда: Week Warrior badge! 🏆',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'Claim Badge', action: 'claim_achievement' },
            { label: 'Amazing!', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'streak', days: 7 },
        frequency_rules: { max_per_day: 1, cooldown_hours: 168 },
        is_active: true
    },
    {
        code: 'streak_30_days',
        trigger_type: 'streak',
        message_template: '🔥🔥🔥 LEGEND! 30 дни подред!\n\nСамо 5% достигат до тук.\n\nУнлокваш Month Master + специален prompt pack! 💎',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'Claim Rewards', action: 'claim_achievement' },
            { label: 'Share Achievement', action: 'share' }
        ],
        trigger_conditions: { type: 'streak', days: 30 },
        frequency_rules: { max_per_day: 1, cooldown_hours: 168 },
        is_active: true
    },

    // ======================
    // PLATEAU DETECTION
    // ======================
    {
        code: 'plateau_nudge',
        trigger_type: 'plateau',
        message_template: 'Хей, {{user.name}}... всичко наред ли? 🤔\n\nЗнам че живота е забързан, но помниш ли защо започна това journey?\n\nНека да направим бърз 10-min challenge. Guarantee ти, че ще ти хареса!\n\nP.S. Пропускам те 🥺',
        avatar_emotion: 'supportive',
        action_buttons: [
            { label: 'Quick 10-Min Challenge', action: 'quick_challenge' },
            { label: 'I Need a Break', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'inactivity', days: 3 },
        frequency_rules: { max_per_day: 1, cooldown_hours: 72 },
        is_active: true
    },

    // ======================
    // ACHIEVEMENT CELEBRATION
    // ======================
    {
        code: 'achievement_unlocked',
        trigger_type: 'achievement',
        message_template: '🎉🎊 HELL YEAH! 🎊🎉\n\nТи just unlockна\'{{achievement.name}}\'!\n\n→ +{{achievement.xp}} XP\n→ New badge in collection\n\nP.S. Горд съм с теб! 💪',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'View Badge', action: 'view_achievement' },
            { label: 'Share It', action: 'share' }
        ],
        trigger_conditions: { type: 'achievement_unlocked' },
        frequency_rules: { max_per_day: 10, cooldown_hours: 0 },
        is_active: true
    },

    // ======================
    // LEVEL UP
    // ======================
    {
        code: 'level_up',
        trigger_type: 'level_up',
        message_template: '⬆️ LEVEL UP! ⬆️\n\nПоздравления, {{user.name}}!\nНов титул: {{new_title}}\n\nНови възможности unlocked! 🚀',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: "What's New?", action: 'view_unlocks' },
            { label: 'Awesome!', action: 'dismiss' }
        ],
        trigger_conditions: { type: 'level_up' },
        frequency_rules: { max_per_day: 5, cooldown_hours: 0 },
        is_active: true
    },

    // ======================
    // PATTERN RECOGNITION
    // ======================
    {
        code: 'pattern_email_prompts',
        trigger_type: 'pattern',
        message_template: 'Psst... {{user.name}}, забелязах pattern. 🔍\n\nТи ОБИЧАШ email prompts! 📧\n\nЕто ти custom template based on твоя style:\n\n\'Act as [role] for [industry]...\'\n\n+5 варианта just for you!',
        avatar_emotion: 'mysterious',
        action_buttons: [
            { label: 'Add to My Library', action: 'add_templates' },
            { label: 'Show Me More', action: 'show_more' }
        ],
        trigger_conditions: {
            type: 'pattern_detection',
            category: 'email',
            min_copies: 5
        },
        frequency_rules: { max_per_day: 1, cooldown_hours: 48 },
        is_active: true
    },

    // ======================
    // LATE NIGHT WARRIOR
    // ======================
    {
        code: 'night_owl_detected',
        trigger_type: 'time_based',
        message_template: 'Oo, midnight oil! 🌙\n\nTrue ninjas train when others sleep.\n\nЕто ти \'Night Owl\' achievement + bonus pack of late-night productivity prompts.\n\n(Но сериозно, sleep is важен! 😴)',
        avatar_emotion: 'mysterious',
        action_buttons: [
            { label: 'Claim Night Owl Badge', action: 'claim_achievement' },
            { label: 'One More Lesson', action: 'continue' }
        ],
        trigger_conditions: {
            type: 'time_based',
            time_range: { start: '23:00', end: '06:00' },
            count: 1
        },
        frequency_rules: { max_per_day: 1, cooldown_hours: 168 },
        is_active: true
    },

    // ======================
    // GOAL PROXIMITY
    // ======================
    {
        code: 'almost_level_up',
        trigger_type: 'goal_proximity',
        message_template: '‼️ {{user.name}}, ALMOST THERE!\n\nОще {{remaining_xp}} XP до Level {{next_level}}!\n\nТова е само 1 lesson away!\nЕто ти shortcut:\n\n\'{{suggested_lesson}}\'\n→ 15 min\n→ {{xp_value}} XP\n→ LEVEL UP! 🚀',
        avatar_emotion: 'excited',
        action_buttons: [
            { label: 'Quick Level Up', action: 'start_lesson' },
            { label: 'Choose My Path', action: 'browse' }
        ],
        trigger_conditions: {
            type: 'xp_proximity',
            percentage: 80
        },
        frequency_rules: { max_per_day: 2, cooldown_hours: 12 },
        is_active: true
    },

    // ======================
    // RANDOM ENCOURAGEMENT
    // ======================
    {
        code: 'random_tip',
        trigger_type: 'random',
        message_template: '💡 Fun fact:\n\n{{random_tip}}\n\nМалък подарък от мен за теб! ❤️',
        avatar_emotion: 'happy',
        action_buttons: [
            { label: 'Thanks!', action: 'dismiss' },
            { label: 'More Tips', action: 'view_tips' }
        ],
        trigger_conditions: { type: 'random', probability: 0.15 },
        frequency_rules: { max_per_day: 1, cooldown_hours: 24 },
        is_active: true
    }
]

async function seedCompanionMessages() {
    console.log('🤖 Seeding companion messages...')

    try {
        // Check if messages already exist
        const { data: existing } = await supabase
            .from('companion_messages')
            .select('code')

        const existingCodes = new Set(existing?.map(m => m.code) || [])

        // Filter out already existing messages
        const newMessages = companionMessages.filter(m => !existingCodes.has(m.code))

        if (newMessages.length === 0) {
            console.log('✅ All companion messages already seeded')
            return
        }

        const { data, error } = await supabase
            .from('companion_messages')
            .insert(newMessages)
            .select()

        if (error) {
            console.error('❌ Error seeding companion messages:', error)
            throw error
        }

        console.log(`✅ Successfully seeded ${newMessages.length} companion messages`)
        console.log('\nMessages by type:')
        console.log(`Welcome: ${newMessages.filter(m => m.trigger_type === 'welcome').length}`)
        console.log(`Streak: ${newMessages.filter(m => m.trigger_type === 'streak').length}`)
        console.log(`Plateau: ${newMessages.filter(m => m.trigger_type === 'plateau').length}`)
        console.log(`Achievement: ${newMessages.filter(m => m.trigger_type === 'achievement').length}`)
        console.log(`Pattern: ${newMessages.filter(m => m.trigger_type === 'pattern').length}`)
        console.log(`Other: ${newMessages.filter(m => !['welcome', 'streak', 'plateau', 'achievement', 'pattern'].includes(m.trigger_type)).length}`)
    } catch (error) {
        console.error('❌ Failed to seed companion messages:', error)
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    seedCompanionMessages().then(() => {
        console.log('\n🎉 Companion messages seeding complete!')
        process.exit(0)
    })
}

export { seedCompanionMessages }
