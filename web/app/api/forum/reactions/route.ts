import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import type { ReactionType } from '@/lib/forum-types'

const VALID_REACTIONS: ReactionType[] = ['like', 'love', 'helpful', 'insightful', 'creative']

// POST /api/forum/reactions - Add a reaction
export async function POST(request: NextRequest) {
    try {
        // Use token-based auth from Authorization header
        const { supabase, user, error: authError } = await createSupabaseWithToken(request)

        if (authError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id
        const body = await request.json()

        // Validate
        if (!body.reaction_type || !VALID_REACTIONS.includes(body.reaction_type)) {
            return NextResponse.json(
                { error: 'Invalid reaction type' },
                { status: 400 }
            )
        }

        if (!body.post_id && !body.topic_id) {
            return NextResponse.json(
                { error: 'Either post_id or topic_id is required' },
                { status: 400 }
            )
        }

        // Create reaction
        const { data: reaction, error: insertError } = await supabase
            .from('forum_reactions')
            .insert({
                user_id: userId,
                post_id: body.post_id || null,
                topic_id: body.topic_id || null,
                reaction_type: body.reaction_type
            })
            .select()
            .single()

        if (insertError) {
            // Duplicate reaction
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Already reacted with this emoji' },
                    { status: 409 }
                )
            }
            console.error('Error creating reaction:', insertError)
            return NextResponse.json(
                { error: 'Failed to add reaction' },
                { status: 500 }
            )
        }

        return NextResponse.json({ reaction }, { status: 201 })
    } catch (error) {
        console.error('Reaction create error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/forum/reactions - Remove a reaction
export async function DELETE(request: NextRequest) {
    try {
        // Use token-based auth from Authorization header
        const { supabase, user, error: authError } = await createSupabaseWithToken(request)

        if (authError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id
        const { searchParams } = new URL(request.url)

        const postId = searchParams.get('post_id')
        const topicId = searchParams.get('topic_id')
        const reactionType = searchParams.get('reaction_type') as ReactionType

        if (!reactionType || !VALID_REACTIONS.includes(reactionType)) {
            return NextResponse.json(
                { error: 'Invalid reaction type' },
                { status: 400 }
            )
        }

        if (!postId && !topicId) {
            return NextResponse.json(
                { error: 'Either post_id or topic_id is required' },
                { status: 400 }
            )
        }

        // Build delete query
        let query = supabase
            .from('forum_reactions')
            .delete()
            .eq('user_id', userId)
            .eq('reaction_type', reactionType)

        if (postId) {
            query = query.eq('post_id', postId)
        } else if (topicId) {
            query = query.eq('topic_id', topicId)
        }

        const { error: deleteError } = await query

        if (deleteError) {
            console.error('Error removing reaction:', deleteError)
            return NextResponse.json(
                { error: 'Failed to remove reaction' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Reaction removed' })
    } catch (error) {
        console.error('Reaction delete error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
