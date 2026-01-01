import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAnon, createSupabaseWithToken } from '@/lib/supabase-server'
import { calculateTrustLevel } from '@/lib/forum-types'
import type { SupabaseClient } from '@supabase/supabase-js'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/forum/topics/[id] - Get single topic with posts
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = createSupabaseAnon()

        // Try to get current user from Authorization header
        let currentUserId: string | undefined = undefined
        const authHeader = request.headers.get('authorization')
        if (authHeader) {
            const { user } = await createSupabaseWithToken(request)
            currentUserId = user?.id
        }

        const isSlug = !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

        // Fetch topic
        let topicQuery = supabase
            .from('forum_topics')
            .select(`
        *,
        author:profiles!forum_topics_author_id_fkey(id, name, avatar_url),
        category:forum_categories!forum_topics_category_id_fkey(id, name, slug, icon),
        topic_tags:forum_topic_tags(tag:forum_tags(id, name, color))
      `)
            .eq('is_hidden', false)

        if (isSlug) {
            topicQuery = topicQuery.eq('slug', id)
        } else {
            topicQuery = topicQuery.eq('id', id)
        }

        const { data: topic, error: topicError } = await topicQuery.single()

        if (topicError || !topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            )
        }

        // Fetch author's level
        let authorLevel = 1
        if ((topic as { author?: { id?: string } }).author?.id) {
            const { data: levelData } = await supabase
                .from('user_levels')
                .select('level')
                .eq('user_id', (topic as { author: { id: string } }).author.id)
                .single()
            authorLevel = (levelData as { level?: number } | null)?.level || 1
        }

        // Fetch posts
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(id, name, avatar_url)
      `)
            .eq('topic_id', (topic as { id: string }).id)
            .eq('is_hidden', false)
            .order('created_at', { ascending: true })

        if (postsError) {
            console.error('Error fetching posts:', postsError)
        }

        // Fetch reactions for topic and posts
        const postIds = (posts as Array<{ id: string }> || []).map(p => p.id).join(',')
        const { data: reactions } = await supabase
            .from('forum_reactions')
            .select('*')
            .or(`topic_id.eq.${(topic as { id: string }).id}${postIds ? `,post_id.in.(${postIds})` : ''}`)


        // Process topic reactions
        const topicReactions = processReactions(
            reactions?.filter(r => r.topic_id === topic.id) || [],
            currentUserId
        )

        // Fetch levels for all post authors
        const authorIds = posts?.map(p => p.author?.id).filter(Boolean) || []
        const { data: authorLevels } = await supabase
            .from('user_levels')
            .select('user_id, level')
            .in('user_id', authorIds)

        const levelMap = new Map(authorLevels?.map(l => [l.user_id, l.level]) || [])

        // Transform posts with reactions and levels
        const transformedPosts = (posts || []).map(post => {
            const postReactions = processReactions(
                reactions?.filter(r => r.post_id === post.id) || [],
                currentUserId
            )
            const postAuthorLevel = post.author?.id ? levelMap.get(post.author.id) || 1 : 1

            return {
                ...post,
                author_name: post.author?.name || 'Анонимен',
                author_avatar: post.author?.avatar_url || null,
                author_level: postAuthorLevel,
                author_trust_level: calculateTrustLevel(postAuthorLevel),
                reactions: postReactions
            }
        })

        // Increment view count (non-blocking) - skip if explicitly requested
        const { searchParams } = new URL(request.url)
        const skipViewCount = searchParams.get('skipViewCount') === 'true'
        if (!skipViewCount) {
            incrementViewCount(supabase, (topic as { id: string }).id, currentUserId, request)
        }

        // Check if user is platform admin
        let isAdmin = false
        if (currentUserId) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', currentUserId)
                .single()
            isAdmin = profileData?.role === 'admin'
        }

        // Transform response
        const response = {
            topic: {
                ...topic,
                author_name: topic.author?.name || 'Анонимен',
                author_avatar: topic.author?.avatar_url || null,
                author_level: authorLevel,
                author_trust_level: calculateTrustLevel(authorLevel),
                category_name: topic.category?.name || null,
                category_slug: topic.category?.slug || null,
                category_icon: topic.category?.icon || null,
                tags: topic.topic_tags?.map((tt: { tag: { name: string } }) => tt.tag) || [],
                reactions: topicReactions
            },
            posts: transformedPosts,
            // Check if current user can perform actions
            permissions: {
                canReply: !!currentUserId && !topic.is_locked,
                canEdit: currentUserId === topic.author?.id,
                canMarkSolution: currentUserId === topic.author?.id && topic.is_question,
                canEditWiki: currentUserId && calculateTrustLevel(
                    levelMap.get(currentUserId) || 1
                ) >= 3 && topic.wiki_mode,
                canModerate: isAdmin || (currentUserId && calculateTrustLevel(
                    levelMap.get(currentUserId) || 1
                ) >= 4)
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Topic detail API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH /api/forum/topics/[id] - Update topic (wiki edit, mark solved, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Authenticate via token
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id
        const body = await request.json()

        // Get topic
        const { data: topic, error: topicError } = await supabase
            .from('forum_topics')
            .select('*, author_id')
            .eq('id', id)
            .single()

        if (topicError || !topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            )
        }

        // Get user's trust level
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const trustLevel = calculateTrustLevel(userLevel?.level || 1)

        // Check if user is platform admin
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        const isAdmin = profileData?.role === 'admin'

        // Determine what can be updated
        const isAuthor = userId === topic.author_id
        const canModerate = isAdmin || trustLevel >= 4
        const canEditWiki = trustLevel >= 3 && topic.wiki_mode

        const updates: Record<string, unknown> = {}

        // Wiki content edit
        if ('content' in body && canEditWiki) {
            // Save edit history
            await supabase.from('forum_wiki_edits').insert({
                topic_id: id,
                editor_id: userId,
                previous_content: topic.content,
                new_content: body.content,
                edit_summary: body.edit_summary || null
            })

            updates.content = body.content
            updates.preview = body.content.substring(0, 200).replace(/\n/g, ' ')
            updates.updated_at = new Date().toISOString()
        }

        // Title edit (author only)
        if ('title' in body && isAuthor) {
            updates.title = body.title
            // Don't update slug to preserve SEO
        }

        // Moderation actions
        if (canModerate) {
            if ('is_pinned' in body) updates.is_pinned = body.is_pinned
            if ('is_locked' in body) updates.is_locked = body.is_locked
            if ('is_hidden' in body) updates.is_hidden = body.is_hidden
        }

        // Check if any updates
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid updates provided or insufficient permissions' },
                { status: 400 }
            )
        }

        // Apply updates
        const { data: updatedTopic, error: updateError } = await supabase
            .from('forum_topics')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating topic:', updateError)
            return NextResponse.json(
                { error: 'Failed to update topic' },
                { status: 500 }
            )
        }

        return NextResponse.json({ topic: updatedTopic })
    } catch (error) {
        console.error('Update topic error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/forum/topics/[id] - Delete topic (admin/moderator only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Authenticate via token
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id

        // Get user's trust level and role
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        const trustLevel = calculateTrustLevel(userLevel?.level || 1)
        const isAdmin = profileData?.role === 'admin'
        const canModerate = isAdmin || trustLevel >= 4

        if (!canModerate) {
            return NextResponse.json(
                { error: 'Insufficient permissions to delete topic' },
                { status: 403 }
            )
        }

        // Delete topic (cascade will handle posts, reactions, etc.)
        const { error: deleteError } = await supabase
            .from('forum_topics')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('Error deleting topic:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete topic' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: 'Topic deleted' })
    } catch (error) {
        console.error('Delete topic error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to process reactions into summary
function processReactions(
    reactions: Array<{ reaction_type: string; user_id: string }>,
    currentUserId?: string
) {
    const reactionTypes = ['like', 'love', 'helpful', 'insightful', 'creative'] as const

    return reactionTypes.map(type => ({
        type,
        count: reactions.filter(r => r.reaction_type === type).length,
        hasReacted: currentUserId
            ? reactions.some(r => r.reaction_type === type && r.user_id === currentUserId)
            : false
    }))
}

// Helper function to increment view count (non-blocking)
async function incrementViewCount(
    supabase: SupabaseClient,
    topicId: string,
    userId?: string,
    request?: NextRequest
) {
    try {
        // Just increment view count using RPC
        await supabase.rpc('increment_topic_views', { p_topic_id: topicId })
    } catch (error) {
        console.error('Error incrementing view count:', error)
    }
}
