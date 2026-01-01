// Forum Types for CyberNinjas Platform

export interface ForumCategory {
    id: string
    slug: string
    name: string
    description: string | null
    icon: string | null
    color: string | null
    order_index: number
    is_active: boolean
    topics_count: number
    posts_count: number
    created_at: string
}

export interface ForumTag {
    id: string
    slug: string
    name: string
    color: string
    usage_count: number
}

export interface ForumTopic {
    id: string
    slug: string
    title: string
    content: string
    preview: string | null
    author_id: string | null
    category_id: string | null
    is_question: boolean
    is_solved: boolean
    wiki_mode: boolean
    is_pinned: boolean
    is_locked: boolean
    is_hidden: boolean
    posts_count: number
    views_count: number
    reactions_count: number
    created_at: string
    updated_at: string
    last_activity_at: string
    meta_title: string | null
    meta_description: string | null
    // Joined fields
    author_name?: string
    author_avatar?: string
    author_level?: number
    author_trust_level?: TrustLevel
    category_name?: string
    category_slug?: string
    category_icon?: string
    tags?: string[]
}

export interface ForumPost {
    id: string
    topic_id: string
    author_id: string | null
    content: string
    parent_id: string | null
    is_solution: boolean
    is_hidden: boolean
    reactions_count: number
    created_at: string
    updated_at: string
    // Joined fields
    author_name?: string
    author_avatar?: string
    author_level?: number
    author_trust_level?: TrustLevel
    reactions?: ReactionSummary[]
}

export type ReactionType = 'like' | 'love' | 'helpful' | 'insightful' | 'creative'

export interface ForumReaction {
    id: string
    post_id: string | null
    topic_id: string | null
    user_id: string
    reaction_type: ReactionType
    created_at: string
}

export interface ReactionSummary {
    type: ReactionType
    count: number
    hasReacted: boolean
}

export interface ForumNotification {
    id: string
    user_id: string
    type: 'mention' | 'reply' | 'reaction' | 'solution' | 'wiki_edit' | 'achievement'
    topic_id: string | null
    post_id: string | null
    actor_id: string | null
    title: string
    message: string | null
    is_read: boolean
    created_at: string
    // Joined fields
    actor_name?: string
    actor_avatar?: string
    topic_title?: string
}

export interface ForumUserStats {
    user_id: string
    topics_count: number
    posts_count: number
    solutions_count: number
    reactions_received: number
    wiki_edits_count: number
}

// Trust Levels based on user_levels.level
// 1 = Novice (Level 1-2): Can read, react, post 1/hour
// 2 = Member (Level 3-5): Unlimited posts + reactions
// 3 = Veteran (Level 6-10): + Wiki edit
// 4 = Moderator (Level 10+): + Pin/Lock topics
export type TrustLevel = 1 | 2 | 3 | 4

export const TRUST_LEVEL_NAMES: Record<TrustLevel, string> = {
    1: 'Новак',
    2: 'Член',
    3: 'Ветеран',
    4: 'Модератор'
}

export const TRUST_LEVEL_ICONS: Record<TrustLevel, string> = {
    1: '🌱',
    2: '👤',
    3: '⭐',
    4: '🛡️'
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
    like: '👍',
    love: '❤️',
    helpful: '🎯',
    insightful: '🧠',
    creative: '💡'
}

// API Request/Response types
export interface CreateTopicRequest {
    title: string
    content: string
    category_id: string
    is_question?: boolean
    wiki_mode?: boolean
    tags?: string[]
}

export interface CreatePostRequest {
    topic_id: string
    content: string
    parent_id?: string
}

export interface TopicsListResponse {
    topics: ForumTopic[]
    nextCursor: string | null
    total: number
}

export interface SearchResult {
    topics: ForumTopic[]
    posts: ForumPost[]
    total: number
}

// Utility function to calculate trust level
export function calculateTrustLevel(userLevel: number | null): TrustLevel {
    if (!userLevel || userLevel < 3) return 1
    if (userLevel < 6) return 2
    if (userLevel < 10) return 3
    return 4
}

// Utility function to check permissions
export function canPerformAction(
    trustLevel: TrustLevel,
    action: 'post' | 'react' | 'wiki_edit' | 'moderate'
): boolean {
    switch (action) {
        case 'post':
            return trustLevel >= 1 // All can post (with rate limits for Novice)
        case 'react':
            return trustLevel >= 1 // All can react (changed from 2)
        case 'wiki_edit':
            return trustLevel >= 3 // Veterans and above
        case 'moderate':
            return trustLevel >= 4 // Moderators only
        default:
            return false
    }
}
