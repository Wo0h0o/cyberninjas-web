import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { calculateTrustLevel } from '@/lib/forum-types'

interface RouteParams {
    params: Promise<{ id: string }>
}

// DELETE /api/forum/posts/[id] - Delete a post (admin/moderator only)
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

        // Get the post to check ownership
        const { data: post, error: postError } = await supabase
            .from('forum_posts')
            .select('id, author_id, topic_id')
            .eq('id', id)
            .single()

        if (postError || !post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

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

        const trustLevel = calculateTrustLevel((userLevel as { level?: number })?.level || 1)
        const isAdmin = (profileData as { role?: string })?.role === 'admin'
        const isAuthor = userId === (post as { author_id?: string }).author_id
        const canModerate = isAdmin || trustLevel >= 4

        // Allow deletion if user is admin/moderator or the author
        if (!canModerate && !isAuthor) {
            return NextResponse.json(
                { error: 'Insufficient permissions to delete post' },
                { status: 403 }
            )
        }

        // Delete the post
        const { error: deleteError } = await supabase
            .from('forum_posts')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('Error deleting post:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete post' },
                { status: 500 }
            )
        }

        // Update topic's posts count
        await supabase.rpc('decrement_topic_posts', {
            p_topic_id: (post as { topic_id: string }).topic_id
        }).catch(() => {
            // If RPC doesn't exist, manually update
            console.log('decrement_topic_posts RPC not available')
        })

        return NextResponse.json({ success: true, message: 'Post deleted' })
    } catch (error) {
        console.error('Delete post error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
