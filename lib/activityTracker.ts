import { supabase } from './supabase'

export type ActivityType =
    | 'lesson_started'
    | 'lesson_completed'
    | 'lesson_progress'
    | 'prompt_copied'
    | 'prompt_favorited'
    | 'prompt_viewed'
    | 'guide_viewed'
    | 'guide_completed'
    | 'resource_downloaded'
    | 'resource_viewed'

export type FeatureArea = 'courses' | 'prompts' | 'guides' | 'resources'

interface TrackActivityParams {
    activityType: ActivityType
    featureArea: FeatureArea
    itemId?: string
    metadata?: Record<string, any>
}

/**
 * Track user activity across all platform features
 * This enables adaptive dashboard and cross-feature progress tracking
 */
export async function trackActivity({
    activityType,
    featureArea,
    itemId,
    metadata = {}
}: TrackActivityParams): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.warn('Cannot track activity: No authenticated user')
            return
        }

        // Insert activity event
        const { error: activityError } = await supabase
            .from('user_activity')
            .insert({
                user_id: user.id,
                activity_type: activityType,
                feature_area: featureArea,
                item_id: itemId,
                metadata
            })

        if (activityError) {
            console.error('Error tracking activity:', activityError)
            return
        }

        // Update aggregated stats via database function
        const { error: statsError } = await supabase.rpc('increment_user_stat', {
            p_user_id: user.id,
            p_activity_type: activityType,
            p_feature_area: featureArea
        })

        if (statsError) {
            console.error('Error updating stats:', statsError)
        }

    } catch (error) {
        console.error('Unexpected error in trackActivity:', error)
    }
}

/**
 * Get user's last activity across all features
 */
export async function getLastActivity(userId: string) {
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching last activity:', error)
        return null
    }

    return data
}

/**
 * Get activity summary for a specific feature
 */
export async function getFeatureActivity(
    userId: string,
    featureArea: FeatureArea,
    limit = 10
) {
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_area', featureArea)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error(`Error fetching ${featureArea} activity:`, error)
        return []
    }

    return data
}
