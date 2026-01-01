import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '5')

        // Fetch top contributors by contribution points
        const { data: contributors, error } = await supabase
            .from('forum_user_stats')
            .select(`
                user_id,
                contribution_points,
                topics_count,
                posts_count,
                profiles:user_id (
                    name,
                    avatar_url
                )
            `)
            .gt('contribution_points', 0)
            .order('contribution_points', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching top contributors:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform the data for easier frontend consumption
        const formattedContributors = contributors?.map((c: any) => ({
            user_id: c.user_id,
            name: c.profiles?.name || 'Анонимен',
            avatar_url: c.profiles?.avatar_url || null,
            points: c.contribution_points,
            topics_count: c.topics_count,
            posts_count: c.posts_count
        })) || []

        return NextResponse.json({
            contributors: formattedContributors,
            success: true
        })

    } catch (error) {
        console.error('Top contributors API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch top contributors' },
            { status: 500 }
        )
    }
}
