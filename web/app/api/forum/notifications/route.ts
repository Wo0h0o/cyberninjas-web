import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/forum/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()

        // Get current user
        const { data: { session }, error: authError } = await supabase.auth.getSession()

        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = session.user.id
        const { searchParams } = new URL(request.url)

        const unreadOnly = searchParams.get('unread') === 'true'
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

        // Build query
        let query = supabase
            .from('forum_notifications')
            .select(`
        *,
        actor:profiles!forum_notifications_actor_id_fkey(name, avatar_url),
        topic:forum_topics(title, slug)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (unreadOnly) {
            query = query.eq('is_read', false)
        }

        const { data: notifications, error } = await query

        if (error) {
            console.error('Error fetching notifications:', error)
            return NextResponse.json(
                { error: 'Failed to fetch notifications' },
                { status: 500 }
            )
        }

        // Get unread count
        const { count: unreadCount } = await supabase
            .from('forum_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        // Transform notifications
        const transformedNotifications = notifications?.map(n => ({
            ...n,
            actor_name: (n.actor as { name: string } | null)?.name || null,
            actor_avatar: (n.actor as { avatar_url: string } | null)?.avatar_url || null,
            topic_title: (n.topic as { title: string } | null)?.title || null,
            topic_slug: (n.topic as { slug: string } | null)?.slug || null
        })) || []

        return NextResponse.json({
            notifications: transformedNotifications,
            unreadCount: unreadCount || 0
        })
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH /api/forum/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()

        // Get current user
        const { data: { session }, error: authError } = await supabase.auth.getSession()

        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = session.user.id
        const body = await request.json()

        // Can mark single notification or all
        if (body.notification_id) {
            // Mark single notification
            const { error } = await supabase
                .from('forum_notifications')
                .update({ is_read: true })
                .eq('id', body.notification_id)
                .eq('user_id', userId)

            if (error) {
                console.error('Error marking notification:', error)
                return NextResponse.json(
                    { error: 'Failed to mark notification' },
                    { status: 500 }
                )
            }
        } else if (body.mark_all_read) {
            // Mark all as read
            const { error } = await supabase
                .from('forum_notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (error) {
                console.error('Error marking all notifications:', error)
                return NextResponse.json(
                    { error: 'Failed to mark notifications' },
                    { status: 500 }
                )
            }
        } else {
            return NextResponse.json(
                { error: 'Either notification_id or mark_all_read is required' },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'Notifications updated' })
    } catch (error) {
        console.error('Notifications update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
