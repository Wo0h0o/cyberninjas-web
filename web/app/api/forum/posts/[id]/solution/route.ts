import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { calculateTrustLevel } from '@/lib/forum-types'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/forum/posts/[id]/solution - Mark post as solution
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: postId } = await params

        // Authenticate via token
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id

        // Get the post and its topic
        const { data: post, error: postError } = await supabase
            .from('forum_posts')
            .select('id, topic_id, is_solution')
            .eq('id', postId)
            .single()

        if (postError || !post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Get topic to verify ownership
        const { data: topic, error: topicError } = await supabase
            .from('forum_topics')
            .select('id, author_id, is_question, is_solved')
            .eq('id', post.topic_id)
            .single()

        if (topicError || !topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            )
        }

        // Check if user is topic author or moderator
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const trustLevel = calculateTrustLevel(userLevel?.level || 1)
        const isTopicAuthor = userId === topic.author_id
        const canModerate = trustLevel >= 4

        if (!isTopicAuthor && !canModerate) {
            return NextResponse.json(
                { error: 'Само авторът на темата може да маркира решение' },
                { status: 403 }
            )
        }

        if (!topic.is_question) {
            return NextResponse.json(
                { error: 'Само въпроси могат да имат решения' },
                { status: 400 }
            )
        }

        // Unmark previous solution if exists
        if (topic.is_solved) {
            await supabase
                .from('forum_posts')
                .update({ is_solution: false })
                .eq('topic_id', topic.id)
                .eq('is_solution', true)
        }

        // Mark this post as solution
        const { data: updatedPost, error: updateError } = await supabase
            .from('forum_posts')
            .update({ is_solution: true })
            .eq('id', postId)
            .select()
            .single()

        if (updateError) {
            console.error('Error marking solution:', updateError)
            return NextResponse.json(
                { error: 'Failed to mark solution' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            post: updatedPost,
            message: 'Отговорът е маркиран като решение!'
        })
    } catch (error) {
        console.error('Mark solution error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/forum/posts/[id]/solution - Unmark solution
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: postId } = await params

        // Authenticate via token
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id

        // Get the post
        const { data: post } = await supabase
            .from('forum_posts')
            .select('id, topic_id')
            .eq('id', postId)
            .single()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Get topic to verify ownership
        const { data: topic } = await supabase
            .from('forum_topics')
            .select('author_id')
            .eq('id', post.topic_id)
            .single()

        // Check permissions
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const trustLevel = calculateTrustLevel(userLevel?.level || 1)
        const isTopicAuthor = userId === topic?.author_id
        const canModerate = trustLevel >= 4

        if (!isTopicAuthor && !canModerate) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Unmark solution
        await supabase
            .from('forum_posts')
            .update({ is_solution: false })
            .eq('id', postId)

        // Update topic
        await supabase
            .from('forum_topics')
            .update({ is_solved: false })
            .eq('id', post.topic_id)

        return NextResponse.json({ message: 'Solution unmarked' })
    } catch (error) {
        console.error('Unmark solution error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
