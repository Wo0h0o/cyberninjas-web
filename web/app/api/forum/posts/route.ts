import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import type { CreatePostRequest } from '@/lib/forum-types'
import { calculateTrustLevel } from '@/lib/forum-types'
import type { SupabaseClient } from '@supabase/supabase-js'

// POST /api/forum/posts - Create a new post/reply
export async function POST(request: NextRequest) {
    try {
        // Authenticate via token
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id
        const body: CreatePostRequest = await request.json()

        // Validate required fields
        if (!body.topic_id || !body.content?.trim()) {
            return NextResponse.json(
                { error: 'Topic ID and content are required' },
                { status: 400 }
            )
        }

        // Check if topic exists and is not locked
        const { data: topic, error: topicError } = await supabase
            .from('forum_topics')
            .select('id, is_locked, author_id, title')
            .eq('id', body.topic_id)
            .single()

        if (topicError || !topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            )
        }

        if (topic.is_locked) {
            return NextResponse.json(
                { error: 'Тази тема е заключена и не приема нови коментари' },
                { status: 403 }
            )
        }

        // Check user trust level for rate limiting
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const level = userLevel?.level || 1
        const trustLevel = calculateTrustLevel(level)

        // Rate limiting for Novice users (trust level 1)
        if (trustLevel === 1) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
            const { count } = await supabase
                .from('forum_posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', userId)
                .gte('created_at', oneHourAgo)

            if (count && count >= 3) {
                return NextResponse.json(
                    { error: 'Можеш да публикуваш само 3 поста на час. Опитай отново по-късно.' },
                    { status: 429 }
                )
            }
        }

        // Create post
        const { data: post, error: insertError } = await supabase
            .from('forum_posts')
            .insert({
                topic_id: body.topic_id,
                author_id: userId,
                content: body.content.trim(),
                parent_id: body.parent_id || null
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating post:', insertError)
            return NextResponse.json(
                { error: 'Failed to create post' },
                { status: 500 }
            )
        }

        // Parse and create @mentions
        const mentions = extractMentions(body.content)
        if (mentions.length > 0) {
            await processMentions(supabase, post.id, userId, mentions, topic)
        }

        // Fetch user info for response
        const { data: author } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', userId)
            .single()

        return NextResponse.json({
            post: {
                ...post,
                author_name: author?.name || 'Потребител',
                author_avatar: author?.avatar_url || null,
                author_level: level,
                author_trust_level: trustLevel,
                reactions: []
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Create post error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to extract @mentions from content
function extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    const matches = content.match(mentionRegex) || []
    return matches.map(m => m.substring(1).toLowerCase())
}

// Process mentions and create notifications
async function processMentions(
    supabase: SupabaseClient,
    postId: string,
    mentioningUserId: string,
    usernames: string[],
    topic: { id: string; title: string }
) {
    try {
        // Find users by name (case-insensitive)
        for (const username of usernames.slice(0, 10)) { // Max 10 mentions
            const { data: user } = await supabase
                .from('profiles')
                .select('id')
                .ilike('name', username)
                .single()

            if (user && user.id !== mentioningUserId) {
                // Create mention record
                await supabase.from('forum_mentions').insert({
                    post_id: postId,
                    mentioned_user_id: user.id,
                    mentioning_user_id: mentioningUserId
                }).onConflict('post_id,mentioned_user_id').ignore()

                // Create notification
                await supabase.from('forum_notifications').insert({
                    user_id: user.id,
                    type: 'mention',
                    topic_id: topic.id,
                    post_id: postId,
                    actor_id: mentioningUserId,
                    title: 'Споменат си',
                    message: `Бяхте споменат в темата: ${topic.title}`
                })
            }
        }
    } catch (error) {
        console.error('Error processing mentions:', error)
        // Don't fail the main request
    }
}
