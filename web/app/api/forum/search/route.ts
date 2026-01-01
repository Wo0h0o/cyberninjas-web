import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

const MAX_RESULTS = 20

// GET /api/forum/search - Search topics and posts
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const { searchParams } = new URL(request.url)

        const query = searchParams.get('q')?.trim()
        const type = searchParams.get('type') || 'all' // all, topics, posts
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), MAX_RESULTS)

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: 'Query must be at least 2 characters' },
                { status: 400 }
            )
        }

        const results: {
            topics: Array<{
                id: string
                slug: string
                title: string
                preview: string | null
                category_name: string | null
                posts_count: number
                created_at: string
            }>
            posts: Array<{
                id: string
                content: string
                topic_id: string
                topic_title: string
                topic_slug: string
                created_at: string
            }>
            total: number
        } = {
            topics: [],
            posts: [],
            total: 0
        }

        // Search topics
        if (type === 'all' || type === 'topics') {
            const { data: topics, error: topicsError } = await supabase
                .from('forum_topics')
                .select(`
          id, slug, title, preview, posts_count, created_at,
          category:forum_categories(name)
        `)
                .eq('is_hidden', false)
                .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
                .order('last_activity_at', { ascending: false })
                .limit(limit)

            if (!topicsError && topics) {
                results.topics = (topics as Array<{
                    id: string
                    slug: string
                    title: string
                    preview: string | null
                    posts_count: number
                    created_at: string
                    category: { name: string } | null
                }>).map(t => ({
                    id: t.id,
                    slug: t.slug,
                    title: t.title,
                    preview: t.preview,
                    category_name: t.category?.name || null,
                    posts_count: t.posts_count,
                    created_at: t.created_at
                }))
                results.total += topics.length
            }
        }

        // Search posts
        if (type === 'all' || type === 'posts') {
            const { data: posts, error: postsError } = await supabase
                .from('forum_posts')
                .select(`
          id, content, topic_id, created_at,
          topic:forum_topics!inner(title, slug, is_hidden)
        `)
                .eq('is_hidden', false)
                .eq('topic:forum_topics.is_hidden', false)
                .ilike('content', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (!postsError && posts) {
                results.posts = (posts as Array<{
                    id: string
                    content: string
                    topic_id: string
                    created_at: string
                    topic: { title: string; slug: string } | null
                }>).map(p => ({
                    id: p.id,
                    content: highlightMatch(p.content, query),
                    topic_id: p.topic_id,
                    topic_title: p.topic?.title || '',
                    topic_slug: p.topic?.slug || '',
                    created_at: p.created_at
                }))
                results.total += posts.length
            }
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to highlight matching text and truncate
function highlightMatch(content: string, query: string): string {
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const matchIndex = lowerContent.indexOf(lowerQuery)

    if (matchIndex === -1) {
        return content.substring(0, 150) + (content.length > 150 ? '...' : '')
    }

    // Get context around match
    const start = Math.max(0, matchIndex - 50)
    const end = Math.min(content.length, matchIndex + query.length + 100)

    let snippet = content.substring(start, end)
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet += '...'

    return snippet
}
